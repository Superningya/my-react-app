import React, { useState, useEffect, useCallback } from 'react';
import { getConfigParams } from './server';

const { location } = window;
const url = location.href;

const timestamp = String(parseInt(Date.now() / 1000)); // 生成签名用的时间戳
const nonce_str = 'Wm3WZYTPz0wzccnW'; // 生成签名用的随机字符串
const jsb = ''; // 自定义测试用JSB方法名
const params = {}; // 自定义测试用JSB方法参数

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  const [sdk, setSdk] = useState(null);
  const [ready, setReady] = useState(false);
  const [configStatus, setConfigStatus] = useState('');
  const [resultMsg, setResultMsg] = useState('');
  const [client_key, setClientKey] = useState('');

  // 打开原生授权页面JSB能力示例
  const onClickAuth = () => {
    if (ready) {
      sdk.jumpOpenAuth({
        params: {
          client_key,
          redirect_uri: location.href,
          state: '',
          scope: 'user_info',
          response_type: 'code'
        },
        success: ({ ticket }) => setResultMsg(`Auth Success: ${ticket}`),
        error: res => setResultMsg(`Auth Error: ${JSON.stringify(res)}`)
      });
    }
  };

  // 可在URL参数中自定义JSB方法名和参数以测试
  const onClickJSB = () => {
    if (ready) {
      sdk[jsb]({
        params,
        success: res => setResultMsg(`JSB ${jsb} Success: ${JSON.stringify(res)}`),
        error: res => setResultMsg(`JSB ${jsb} Error: ${JSON.stringify(res)}`)
      });
    }
  };


  // 使用JSB能力前，必须先通过Config验证签名
  const config = useCallback(async () => {
    const { client_key, signature } = await getConfigParams({ timestamp, nonce_str, url });
    sdk.config({
      params: {
        client_key,
        signature,
        timestamp,
        nonce_str,
        url
      }
    });
    setClientKey(client_key);
  }, [sdk]);

  useEffect(() => {
    setSdk(window.douyin_open);
    if (sdk) {
      setConfigStatus('SDK Loaded');
      config();
      sdk.ready(() => {
        setReady(true);
        setConfigStatus('SDK Config Ready');
      });
      sdk.error(res => {
        setConfigStatus(`SDK Config Error: ${JSON.stringify(res)}`);
      });
    }
  }, [sdk, config]);

  return (
    <>
      <p onClick={() => location.reload()} className="link">{'Reload'}</p>
      <p>{configStatus} </p>
      {
        !ready ? <p>Loading...</p> : (
          <>
            <p onClick={onClickAuth} className="link">Auth</p>
            {jsb && <p onClick={onClickJSB} className="link" style={{ textTransform: 'capitalize' }}>{jsb}</p>}
          </>
        )
      }
      <p>{resultMsg}</p>
    </>
  );
};