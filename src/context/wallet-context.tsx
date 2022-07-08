import React, {useCallback, useEffect, useMemo, useState} from "react";
import {SignerTransaction} from "@perawallet/connect/dist/util/model/peraWalletModels";

interface IWalletContext {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    connecting: boolean;
    connected: boolean;
    account: string|null;
    askWalletToSign: (transactions: SignerTransaction[]) => Promise<Array<Uint8Array|null>|null>;
}

export const WalletContext = React.createContext<IWalletContext>({
    connect: async function() {},
    disconnect: async function() {},
    connecting: false,
    connected: false,
    account: null,
    askWalletToSign: async () => []
})

const WalletContextProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [connecting, setConnecting] = useState<boolean>(false);
    const [connected, setConnected] = useState<boolean>(false);
    const [account, setAccount] = useState<string|null>(null);
    const [pera, setPera] = useState<any|null>(null);

    useEffect(() => {
        if(!!pera) {
            return;
        }

        const init = async () => {
            if(!!pera) {
                return;
            }

            const {PeraWalletConnect} = await import("@perawallet/connect");
            const wc = new PeraWalletConnect();
            setPera(wc);
            wc.reconnectSession().then(accounts => {
                setConnecting(false);
                setAccount(accounts?.[0] ?? null);
                setConnected(true);

                wc.connector?.on("disconnect", (_) => {
                    console.debug("WC disconnect");
                    setConnecting(false);
                    setConnected(false);
                    setAccount(null);
                });
            }).catch((err: any) => {
                console.debug(err);
            });
        }
        init().then();
    }, [pera]);

    const connect = useCallback(async () => {
        if(!pera) {
            return;
        }

        setConnecting(true);
        pera.connect().then((accounts: string[]) => {
            setAccount(accounts?.[0] ?? null);
            setConnecting(false);
            setConnected(true);
            pera.connector?.on("disconnect", (_: any) => {
                console.debug("WC disconnect");
                setConnecting(false);
                setConnected(false);
                setAccount(null);
            });
        }).catch((err: any) => {
            setConnecting(false);
            if (err?.data?.type !== "CONNECT_MODAL_CLOSED") {
                throw new Error("Unable to connect to wallet");
            }
        })
    }, [pera]);

    const disconnect = useCallback(async () => {
        if(!pera) {
            return;
        }
        await pera.disconnect();
    }, [pera]);

    /**
     * Presents transactions to a wallet to sign.
     */
    const askWalletToSign = useCallback(async (transactions: SignerTransaction[]) => {
        if(!pera) {
            return null;
        }

        return pera.signTransaction([transactions]);
    }, [pera]);

    const state: IWalletContext = useMemo(() => {
        return {
            connect,
            disconnect,
            connecting,
            connected,
            account,
            askWalletToSign
        }
    }, [
        connect,
        disconnect,
        connecting,
        connected,
        account,
        askWalletToSign
    ]);

    return (
        <WalletContext.Provider value={state}>
            {children}
        </WalletContext.Provider>
    )
}

export default WalletContextProvider;