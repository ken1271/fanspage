function getInfo(url){
  //console.log('getinfo',url);
  FB.api(url,'GET',function(result){
    //console.log(result);
    if (result.hasOwnProperty('posts')) {
      checkResultType(result.posts)
    }else {
      checkResultType(result)
    }

  });
}
function dealPost(result){
  //console.log('dealpost',result);
  initPosts(result.data[0]);
  //console.log('post',post);

  if(result.data[0].likes.data.length>0&&result.data[0].likes.paging.hasOwnProperty('next')){
    getInfo(result.data[0].likes.paging.next);
    commentUrl=result.data[0].comments.paging.next;
    nextUrl=result.paging.next;
    //console.log('commenturl',commentUrl);
  }
  else {
    if(result.data[0].comments.data.length>0&&result.data[0].comments.paging.hasOwnProperty('next')){
      getInfo(result.data[0].comments.paging.next);
      nextUrl=result.paging.next;
    }
    else{
      firebaseRef.push(post);
      getInfo(result.paging.next);
    }
  }

}
function dealLike(result){
  //console.log('likes',result);
  //console.log(result.data.length);
  //console.log('post',post);
  for(var i=0;i<result.data.length;i++){
    post.likes.push(result.data[i])
  }
  if (result.paging.hasOwnProperty('next')) {
    getInfo(result.paging.next);
  }else {
    if(commentUrl){
      //console.log(commentUrl);
      getInfo(commentUrl);
      commentUrl=''
    }
    else{
      firebaseRef.push(post);
      if(nextUrl){
        getInfo(nextUrl);
        nextUrl='';
      }
      else {
        //console.log('nopost');
      }
    }
  }
}
function dealComment(result){
  //console.log('comments',result);
  //console.log(result.length);
  //console.log('post',post);
  for(var i=0;i<result.length;i++){
    post.comments.push(result.data[i])
  }
  if(result.paging.hasOwnProperty('next')){
    getInfo(result.paging.next);
    commentUrl=''
  }
  else{
    firebaseRef.push(post);
    if(nextUrl){
      getInfo(nextUrl);
      nextUrl='';
    }
    else {
      //console.log('nopost');
    }
  }
}
function checkResultType(result){
  //console.log('check',result);
  if(result.data.length==0){
    //console.log('nopost');
    return;
  }
  if(result.data[0].hasOwnProperty('shares')){
    dealPost(result);
  }
  else {
    if(result.hasOwnProperty('from')){
      dealComment(result);
    }
    else {
      dealLike(result);
    }
  }
}

function initPosts(info){
  post.message=info.message;
  post.likes=info.likes.data;
  post.comments=info.comments.data;
  post.id=info.id;
  post.likes_total=info.likes.summary.total_count,
  post.comments_total=info.comments.summary.total_count
}
