function getInfo(url,post){
  //console.log('getinfo',url);
  FB.api(url,'GET',function(result){
    //console.log(result);
    if (result.hasOwnProperty('posts')) {//確認是否為第一筆資料 回傳資料結構不同
      checkResultType(result.posts,post)
    }else {
      checkResultType(result,post)
    }

  });
}
function dealPost(result){//每次要處理下一筆貼文前 先var新的post

  var post={//
    message:'',
    id:'',
    likes:[],
    comments:[],
    likes_total:0,
    comments_total:0,
  }
  //console.log('dealpost',result);
  post=initPosts(result.data[0],post);
  //console.log('post',post);

  if(result.data[0].likes.data.length>0&&result.data[0].likes.paging.hasOwnProperty('next')){
    getInfo(result.data[0].likes.paging.next,post);
    commentUrl=result.data[0].comments.paging.next;
    nextUrl=result.paging.next;
    //console.log('commenturl',commentUrl);
  }
  else {
    if(result.data[0].comments.data.length>0&&result.data[0].comments.paging.hasOwnProperty('next')){
      getInfo(result.data[0].comments.paging.next,post);
      nextUrl=result.paging.next;
    }
    else{
      firebaseRef.push(post);
      storage.method.pushPost.call(storage,post)
      getInfo(result.paging.next,post);
    }
  }

}
function dealLike(result,post){
  //console.log('likes',result);
  //console.log(result.data.length);
  //console.log('post',post);
  for(var i=0;i<result.data.length;i++){
    post.likes.push(result.data[i])
  }
  if (result.paging.hasOwnProperty('next')) {
    getInfo(result.paging.next,post);
  }else {
    if(commentUrl){
      //console.log(commentUrl);
      getInfo(commentUrl,post);
      commentUrl=''
    }
    else{
      firebaseRef.push(post);
      storage.method.pushPost.call(storage,post)
      if(nextUrl){
        getInfo(nextUrl,post);
        nextUrl='';
      }
      else {
        //console.log('nopost');
      }
    }
  }
}
function dealComment(result,post){
  //console.log('comments',result);
  //console.log(result.length);
  //console.log('post',post);
  for(var i=0;i<result.length;i++){
    post.comments.push(result.data[i])
  }
  if(result.paging.hasOwnProperty('next')){
    getInfo(result.paging.next,post);
    commentUrl=''
  }
  else{
    firebaseRef.push(post);
    storage.method.pushPost.call(storage,post);
    if(nextUrl){
      getInfo(nextUrl,post);
      nextUrl='';
    }
    else {
      //console.log('nopost');
    }
  }
}
function checkResultType(result,post){//判斷回傳的資料是贊 留言 或是下一則貼文
  //console.log('check',result);
  if(result.data.length==0){//資料長度為零時 代表沒有資料了
    //console.log('nopost');
    return;
  }
  if(result.data[0].hasOwnProperty('shares')){//如果有shares 表示這是一則貼文的資料
    dealPost(result);
  }
  else {
    if(result.hasOwnProperty('from')){//如果有from 表示留言
      dealComment(result,post);
    }
    else {
      dealLike(result,post);
    }
  }
}

function initPosts(info,post){//將地一筆資料save
  post.message=info.message;
  post.likes=info.likes.data;
  post.comments=info.comments.data;
  post.id=info.id;
  post.likes_total=info.likes.summary.total_count,
  post.comments_total=info.comments.summary.total_count
  return post;
}
