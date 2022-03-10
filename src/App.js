import logo from "./logo.svg";
import "./App.css";
import Sockette from "sockette";
import { useEffect, useState } from "react";
import update from "immutability-helper";
let ws = null;

function App() {
  const [currentProject, setCurrentProject] = useState();
  const [userID, setUserID] = useState(window.location.href);
  const [connection, setConnection] = useState();
  const [text, setText] = useState();
  const [allText, setAllText] = useState([]);

  useEffect(() => {
    return () => {
      ws && ws.close();
      ws = null;
    };
  }, []);

  const runCall = (projID) => {
    console.log(projID);
    if (ws !== null) {
      ws.close();
    }
    ws = new Sockette(
      `wss://3nroyhtfdc.execute-api.us-east-1.amazonaws.com/production`,
      {
        timeout: 5e3,
        maxAttempts: 10,
        onopen: (e) => {
          console.log("Connected!", e);
          setConnection(true);
        },
        onmessage: (e) => {
          console.log("Received:", e);
          const myData = JSON.parse(e.data);
          setAllText((p) => {
            p = update(p, {
              $push: [{ id: myData.userID, text: myData.text }],
            });
            return p;
          });
        },
        onreconnect: (e) => console.log("Reconnecting...", e),
        onmaximum: (e) => console.log("Stop Attempting!", e),
        onclose: (e) => {
          console.log("Closed!", e);
          setConnection(false);
        },
        onerror: (e) => console.log("Error:", e),
      }
    );
  };

  const disconnect = () => {
    ws && ws.close();
    ws = null;
  };

  const sendMessage = (text) => {
    ws.json({
      action: "onMessage",
      message: { type: "post", text: text, userID: userID },
    });
  };

  return (
    <div className="App">
      <header className="App-header" style={{ height: "100vh" }}>
        <div style={{ height: "100%" }}>
          <h1>WELCOME TO WEBSOCKET TEST</h1>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              height: "80%",
              width: "100vw",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <button
                style={{ fontSize: "30px", margin: " 50px", padding: "20px" }}
                onClick={() => {
                  runCall("project1");
                }}
              >
                Connect to Project 1
              </button>
              <button
                style={{ fontSize: "30px", margin: " 50px", padding: "20px" }}
                onClick={() => {
                  runCall("project2");
                }}
              >
                Connect to Project 2
              </button>
            </div>
            <div
              style={{
                height: "100%",
                backgroundColor: "green",
                width: "5px",
              }}
            ></div>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {connection ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <p>"Connected!"</p>
                  <div>
                    <input
                      type="text"
                      onChange={(e) => {
                        setText(e.target.value);
                      }}
                    />
                    <button
                      onClick={() => {
                        sendMessage(text);
                      }}
                    >
                      Send
                    </button>
                  </div>
                  <br />
                  <div style={{ border: "3px dashed red" }}>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                      {allText.map((item, i) => {
                        return (
                          <li style={{ margin: 0, padding: 0 }}>
                            <b
                              style={{
                                color: item.id === userID ? "green" : "yellow",
                              }}
                            >
                              {item.id}
                            </b>{" "}
                            SAYS :: {item.text}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <br />
                  <button
                    onClick={() => {
                      disconnect();
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                "Not Connected"
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
