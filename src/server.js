// ⚠️注意：本文件内的逻辑请在服务端实现，本Demo只展示用
import axios from 'axios';
import md5 from 'md5';

// 获取 ClientToken
// 详细说明见 http://open-boe.douyin.com/platform/doc/JS-guide
const getClientToken = async ({ client_key, client_secret }) => {
  const { data } = await axios.post('/oauth/client_token/', {
    client_key,
    client_secret,
    grant_type: 'client_credential',
  });
  const { access_token } = data.data || {};
  return access_token;
};

// 获取 Ticket
// 详细说明见 http://open-boe.douyin.com/platform/doc/JS-guide
const getTicket = async ({ access_token }) => {
  const { data } = await axios.get('/js/getticket', {
    params: {
      access_token,
    },
  });
  const { ticket } = data.data || {};
  return ticket;
};

// 计算签名
// 将从服务端获取到的 ticket，随机字串 noncestr，时间戳 timestamp和当前页面url，排序后进行md5加密生成签名
const calcSignature = ({ ticket, nonce_str, timestamp, url }) => {
  const str = `jsapi_ticket=${ticket}&nonce_str=${nonce_str}&timestamp=${timestamp}&url=${url}`;
  const sig = md5(str);
  return sig;
};

// 先获取 Client Token，然后通过 Token 获取 JS Ticket
// 详细说明见 https://open.douyin.com/platform/doc/OpenAPI-oauth2
export const getConfigParams = async ({ timestamp, nonce_str, url }) => {
  const client_key = ''; // clientKey在你的网页应用申请通过后得到
  const client_secret = ''; // clientSecret在你的网页应用申请通过后得到
  const access_token = await getClientToken({ client_key, client_secret });
  const ticket = await getTicket({ access_token });
  const signature = await calcSignature({ ticket, timestamp, nonce_str, url });
  return { client_key, signature };
};
