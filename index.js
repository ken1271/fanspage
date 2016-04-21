$(document).ready(function(){
  fbinit();
  render()
})

var path="https://fans-page.firebaseio.com/";
var firebaseRef = new Firebase(path);

var ref=new Firebase('https://fanscalculation.firebaseio.com/');
ref.set('')
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
        input:input,
        show:'none'
      }
    });
    console.log(ractive.get('show'));
    firebaseRef.on('value',function(snapshot){
      var posts=[];
      snapshot.forEach(function(child){
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
    })
    var num=1;
    var cal = new Calculation();

    firebaseRef.on('child_added',function(snapshot){
      console.log('num',num++);
      console.log('child_added',snapshot.val());
      console.log('calculation',cal);
      cal.method.addLikes.apply(cal,snapshot.val().likes);
      cal.method.addComments.apply(cal,snapshot.val().comments);
      ref.set(cal.data);
    })
    ractive.on('search',function(){
      cal=new Calculation();
      firebaseRef.set('');
      ref.set('');
      var query='?fields=posts.since(2016-03-01).limit(1)%7Bcomments.limit(300).summary(true)%2Clikes.limit(1000).summary(true)%2Cshares%2Cmessage%7D';
      ractive.set('show','block')
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
      var url='./view/likes.html?id='+e.context.key
      window.open(url)
    })
    ractive.on('comments',function(e){
      var url='./view/comments.html?id='+e.context.key
      window.open(url)
    })
    ractive.on('detail',function(){
      var url='./view/detail.html';
      window.open(url)
    })
}
