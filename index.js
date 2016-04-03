$(document).ready(function(){
  //getInfo(url+id+query+token);
  fbinit();
  render()
})

var path="https://fans-page.firebaseio.com/";
var firebaseRef = new Firebase(path);

var url='https://graph.facebook.com/v2.5/';
var id='GoodideasStudio'
//var id='mcdonalds.tw';

var commentUrl='',
    nextUrl='';

var post={
  message:'',
  id:'',
  likes:[],
  comments:''
}

function render(){
    var input={
      id:'',
      date:''
    }
    var ractive=new Ractive({
      el:'#output',
      template: '#template',
      data:{
        //posts:posts,
        input:input
      }
    });

    ractive.on('search',function(){
      firebaseRef.set('')
      var query='?fields=posts.since(2016-03-28).limit(1)%7Bcomments.limit(300).summary(true)%2Clikes.limit(1000).summary(true)%2Cshares%2Cmessage%7D';

      FB.getLoginStatus(function(res){
        if(res.status==='connected'){
          getInfo(url+ractive.get('input.id')+query);
        }
        else {
          FB.login(function(res){
            getInfo(url+ractive.get('input.id')+query);
          });
        }
      })

    });
}
function getInfo(url){
  console.log('getinfo',url);
  FB.api(url,'GET',function(result){
    console.log(result);
    if (result.hasOwnProperty('posts')) {
      checkResultType(result.posts)
    }else {
      checkResultType(result)
    }

  });
}
function dealPost(result){
  console.log('dealpost',result);
  initPosts(result.data[0]);
  console.log('post',post);
  if(result.data[0].likes.paging.next){
    getInfo(result.data[0].likes.paging.next);
    commentUrl=result.data[0].comments.paging.next;
    nextUrl=result.paging.next;
    console.log('commenturl',commentUrl);
  }
  else {
    if(result.data[0].comments.paging.next){
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
  console.log('likes',result);
  console.log(result.data.length);
  console.log('post',post);
  for(var i=0;i<result.data.length;i++){
    post.likes.push(result.data[i])
  }
  if (result.paging.hasOwnProperty('next')) {
    getInfo(result.paging.next);
  }else {
    if(commentUrl){
      console.log(commentUrl);
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
        console.log('nopost');
      }
    }
  }
}
function dealComment(result){
  console.log('comments',result);
  console.log(result.length);
  console.log('post',post);
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
      console.log('nopost');
    }
  }
}
function checkResultType(result){
  console.log('check',result);
  if(result.data.length==0){
    console.log('nopost');
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
}
function fbinit(){
  window.fbAsyncInit = function() {
    FB.init({
      appId: '993401974051375',
      xfbml: true,
      version: 'v2.5'
    });
    getInfo()
  };
  (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
          return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/zh_TW/sdk.js#xfbml=1&version=v2.5";
      fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}
