import { openContractCall, showConnect, UserSession } from "@stacks/connect";
import {
  AnchorMode,
  stringAsciiCV,
  PostConditionMode,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
} from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import React, { useState } from "react";

import ReactDOM from "react-dom";
import { MirloContract } from "./artifacts/contracts.ts";

const userSession = new UserSession();
const network = new StacksMainnet();

const functions = ["claim", "claim-three", "claim-five", "claim-ten"];
const numbers = [1, 3, 5, 10];

export function App() {
  const [user, setUser] = useState();
  const [count, setCount] = useState(1);
  const [status, setStatus] = useState();

  if (user || userSession.isUserSignedIn()) {
    const profile = userSession.loadUserData()?.profile;
    return (
      <div className="mint-container">
        <button
          onClick={() => {
            setStatus(undefined);
            setCount(count - 1 < 1 ? 1 : count - 1);
          }}
        >
          -
        </button>
        <div className="count">{numbers[count]}</div>
        <button
          onClick={() => {
            setStatus(undefined);
            setCount(count + 1 > 4 ? 4 : count + 1);
          }}
        >
          +
        </button>
        <button
          disabled={!profile}
          onClick={() => {
            setStatus(undefined);
            const fn = functions[count - 1];
            openContractCall({
              contractAddress: "SP1QSA6J2HC2TV5NV0Q7X1H6ZBV6SDTDKC4GXBJPY",
              contractName: "mirlos-for-artists-2022",
              functionName: fn.name,
              functionArgs: [],
              anchorMode: AnchorMode.ANY,
              postConditionMode: PostConditionMode.Deny,
              postConditions: [
                makeStandardSTXPostCondition(
                  profile.stxAddress.mainnet,
                  FungibleConditionCode.Equal,
                  numbers[count] * 40_000_000
                ),
              ],
              userSession,
              network,
              onFinish: () => {
                setStatus(fn.name + " transaction sent");
              },
              onCancel: () => {
                setStatus(fn.name + " transaction canceled");
              },
            });
          }}
        >
          Mint
        </button>
        <button
          onClick={() => {
            try {
              userSession.signUserOut();
              setUser(undefined);
              // call isUserSignIn to update the UI
              userSession.isUserSignedIn();
            } catch (e) {
              console.log(e);
            }
          }}
        >
          Disconnect
        </button>
        {status && <div className="status">{status}</div>}
      </div>
    );
  } else {
    return (
      <div className="mint-container">
        <button
          onClick={() =>
            showConnect({
              appDetails: {
                name: "Mirlo Mint",
                icon: "https://youthful-wing-084af9.netlify.app/stackschina.png",
              },
              onFinish: () => {
                setUser(userSession.loadUserData());
              },
            })
          }
        >
          Mint a Mirlo NFT
        </button>
      </div>
    );
  }
}

ReactDOM.render(
  React.createElement(App, {}, null),
  document.getElementById("react-target")
);
