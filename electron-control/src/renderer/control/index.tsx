import React from "react"

const Index = () => {
  const handleCallBack = () => {
    // @ts-ignore
    window.api.controlCallBack('测试回调传参');
  }

  return (
    <div>
      <button onClick={handleCallBack}>测试</button>
    </div>
  )
}

export default Index;