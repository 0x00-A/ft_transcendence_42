import{am as i,i as o,r as n,j as c,B as r,l as f,as as m,D as u}from"./index-erQsObJq.js";const p=()=>{const{token:s}=i(),e=o();return n.useEffect(()=>{(async()=>{var t;if(s){/^[a-zA-Z0-9\-_:]+$/.test(s)||(r.error("Invalid token"),e("/auth"));try{const a=await f.post(m,{token:s});r.success(a.data.message),e("/auth")}catch(a){u.isAxiosError(a)?r.error((t=a==null?void 0:a.response)==null?void 0:t.data.error):r.error("Something went wrong!"),e("/auth")}}})()},[s,e]),c.jsx("div",{children:"verifying your email..."})};export{p as default};
