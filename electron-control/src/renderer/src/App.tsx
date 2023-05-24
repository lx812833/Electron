import { useEffect, useState } from 'react';

function App(): JSX.Element {
  const [remoteCode, setRemoteCode] = useState('');
  const [localCode, setLocalCode] = useState('');
  const [controlText, setControlText] = useState('');

  const handleLogin = async () => {
    // @ts-ignore
    const code = await window.api.login('login');
    setLocalCode(code);
  }

  const startControl = (remoteCode: String) => {
    // @ts-ignore
    window.api.startControl(remoteCode);
  }

  const handleControlState = (e: any, name: String, type: Number) => {
    let text = '';
    if (type === 1) {
      text = `正在远程控制${name}`;
    } else if (type === 2) {
      text = `被${name}控制`;
    }
    setControlText(text);
  }

  useEffect(() => {
    handleLogin();
    // @ts-ignore
    window.api.controlStateChange((e: any) => {
      handleControlState(e, '张三', 1);
    });
    return () => {
      // @ts-ignore
      window.api.controlStateRemove((e: any) => {
        handleControlState(e, '张三', 1);
      });
    }
  }, [])

  return (
    <div className="container">
      {
        controlText === '' ?
          <>
            <div>你的控制码{localCode}</div>
            <input type="text" value={remoteCode} onChange={e => setRemoteCode(e.target.value)} />
            <button onClick={() => startControl(remoteCode)}>确认</button>
          </>
          :
          <>
            <div>{controlText}</div>
          </>
      }
    </div>
  )
}

export default App;
