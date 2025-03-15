import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

export const SerialContext = createContext({
    canUseSerial: false,
    hasTriedAutoconnect: false,
    portState: "closed",
    connect: () => Promise.resolve(false),
    disconnect: () => {},
    subscribe: () => () => {},
});

export const useSerial = () => useContext(SerialContext);

const SerialProvider = ({ children }) => {
    const [canUseSerial] = useState(() => "serial" in navigator);
    const [portState, setPortState] = useState("closed");
    const [hasTriedAutoconnect, setHasTriedAutoconnect] = useState(false);
    const [hasManuallyDisconnected, setHasManuallyDisconnected] = useState(false);

    const portRef = useRef(null);
    const readerRef = useRef(null);
    const readerClosedPromiseRef = useRef(Promise.resolve());

    const currentSubscriberIdRef = useRef(0);
    const subscribersRef = useRef(new Map());

    const subscribe = (callback) => {
        const id = currentSubscriberIdRef.current;
        subscribersRef.current.set(id, callback);
        currentSubscriberIdRef.current++;

        return () => {
            subscribersRef.current.delete(id);
        };
    };

    const readUntilClosed = async (port) => {
        if (port.readable) {
            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            class LineBreakTransformer {
                constructor() {
                    this.container = '';
                }

                transform(chunk, controller) {
                    this.container += chunk;
                    const lines = this.container.split('\r\n');
                    this.container = lines.pop();
                    lines.forEach(line => controller.enqueue(line));
                }

                flush(controller) {
                    if (this.container) {
                        controller.enqueue(this.container);
                    }
                }
            }

            let readable=  textDecoder.readable.pipeThrough(new TransformStream(new LineBreakTransformer()));
            readerRef.current = readable.getReader();

            try {
                while (true) {
                    const { value, done } = await readerRef.current.read();
                    if (done) {
                        break;
                    }
                    const timestamp = Date.now();
                    Array.from(subscribersRef.current).forEach(([name, callback]) => {
                        callback({ value, timestamp });
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                readerRef.current.releaseLock();
            }

            await readableStreamClosed.catch(() => {});
        }
    };

    const openPort = async (port, baudRate) => {
        try {
            await port.open({ baudRate: baudRate });
            portRef.current = port;
            setPortState("open");
            setHasManuallyDisconnected(false);
        } catch (error) {
            setPortState("closed");
            console.error("Could not open port");
        }
    };

    const manualConnectToPort = async (baudRate) => {
        if (canUseSerial && portState === "closed") {
            setPortState("opening");
            try {
                const port = await navigator.serial.requestPort();
                await openPort(port, baudRate);
                return true;
            } catch (error) {
                setPortState("closed");
                console.error("User did not select port");
            }
        }
        return false;
    };

    const manualDisconnectFromPort = async () => {
        if (canUseSerial && portState === "open") {
            const port = portRef.current;
            if (port) {
                setPortState("closing");

                readerRef.current?.cancel();
                await readerClosedPromiseRef.current;
                readerRef.current = null;

                await port.close();
                portRef.current = null;

                setHasManuallyDisconnected(true);
                setHasTriedAutoconnect(false);
                setPortState("closed");
            }
        }
    };

    const onPortDisconnect = async () => {
        await readerClosedPromiseRef.current;
        readerRef.current = null;
        readerClosedPromiseRef.current = Promise.resolve();
        portRef.current = null;
        setHasTriedAutoconnect(false);
        setPortState("closed");
    };

    useEffect(() => {
        const port = portRef.current;
        if (portState === "open" && port) {
            const aborted = { current: false };
            readerRef.current?.cancel();
            readerClosedPromiseRef.current.then(() => {
                if (!aborted.current) {
                    readerRef.current = null;
                    readerClosedPromiseRef.current = readUntilClosed(port);
                }
            });

            navigator.serial.addEventListener("disconnect", onPortDisconnect);

            return () => {
                aborted.current = true;
                navigator.serial.removeEventListener("disconnect", onPortDisconnect);
            };
        }
    }, [portState]);

    useEffect(() => {
        if (
            canUseSerial &&
            !hasManuallyDisconnected &&
            !hasTriedAutoconnect &&
            portState === "closed"
        ) {
            //autoConnectToPort();
        }
    }, [canUseSerial, hasManuallyDisconnected, hasTriedAutoconnect, portState]);

    return (
        <SerialContext.Provider
            value={{
                canUseSerial,
                hasTriedAutoconnect,
                subscribe,
                portState,
                connect: manualConnectToPort,
                disconnect: manualDisconnectFromPort,
            }}
        >
            {children}
        </SerialContext.Provider>
    );
};

export default SerialProvider;
