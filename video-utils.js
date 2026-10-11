(function(root){
  function parseMedia(source,base='https://portfolio.example/'){
    if(typeof source!=='string'||!source.trim())return null;
    let u;try{u=new URL(source.trim(),base);}catch{return null;}
    if(!['https:','http:','file:'].includes(u.protocol))return null;
    if(['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(u.hostname)){
      const id=u.hostname==='youtu.be'?u.pathname.split('/')[1]:u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];
      if(!id||! /^[\w-]{11}$/.test(id))return null;
      return {type:'embed',provider:'YouTube',id,url:`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0`,watch:`https://www.youtube.com/watch?v=${id}`};
    }
    if(['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(u.hostname)){
      const id=u.pathname.match(/(?:\/video)?\/(\d+)/)?.[1];return id?{type:'embed',provider:'Vimeo',url:`https://player.vimeo.com/video/${id}?dnt=1`,watch:`https://vimeo.com/${id}`}:null;
    }
    return {type:'video',url:u.href};
  }
  root.PortfolioVideo={parseMedia};if(typeof module!=='undefined')module.exports={parseMedia};
})(typeof window==='undefined'?globalThis:window);
