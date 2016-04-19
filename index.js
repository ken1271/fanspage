$(document).ready(function(){
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
  comments:[],
  likes_total:0,
  comments_total:0,
}

function render(){
    firebaseRef.set('')
    var input={
      id:'',
      date:''
    }
    var posts=[]
    var ractive=new Ractive({
      el:'#output',
      template: '#template',
      data:{
        posts:posts,
        input:input
      }
    });
    firebaseRef.on('value',function(snapshot){
      var posts=[];
      snapshot.forEach(function(child){
        console.log('child',child.key());
        var post={
          key:child.key(),
          id:child.val().id,
          message:child.val().message,
          likes:child.val().likes_total,
          comments:child.val().comments_total,
        }
        posts.push(post);
      })
      ractive.set('posts',posts)
      console.log('ractiveposts',ractive.get('posts'));
    })
    ractive.on('search',function(){
      firebaseRef.set('')
      var query='?fields=posts.since(2016-01-01).limit(1)%7Bcomments.limit(300).summary(true)%2Clikes.limit(1000).summary(true)%2Cshares%2Cmessage%7D';

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
    ractive.on('likes',function(e){
      console.log(e);
      console.log(e.context.key);
      var url='./view/likes.html?id='+e.context.key
      window.open(url)
    })
    ractive.on('comments',function(e){
      console.log(e);
      console.log(e.context.key);
      var url='./view/comments.html?id='+e.context.key
      window.open(url)
    })
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

  if(result.data[0].likes.data.length>0&&result.data[0].likes.paging.hasOwnProperty('next')){
    getInfo(result.data[0].likes.paging.next);
    commentUrl=result.data[0].comments.paging.next;
    nextUrl=result.paging.next;
    console.log('commenturl',commentUrl);
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
  post.likes_total=info.likes.summary.total_count,
  post.comments_total=info.comments.summary.total_count
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
