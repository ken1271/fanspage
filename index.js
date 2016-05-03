$(document).ready(function(){
  fbinit();
  render();
  //searchbtn();
  $(window).load(function() {
    $("#selectBirthday").birthdaypicker({
        monthFormat: "short",
        maxAge: 100,
        futureDates: false,
        defaultDate: '2016-03-01',
        dateFormat: "bigEndian",
    });
  });
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
    
var storage = new Storage();

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
      // console.log('num',num++);
      // console.log('child_added',snapshot.val());
      // console.log('calculation',cal);
      cal.method.addLikes.apply(cal,snapshot.val().likes);
      cal.method.addComments.apply(cal,snapshot.val().comments);
      console.log('set',cal.data);
      ref.set(cal.data);
      console.log(123);
    })
    ractive.on('search',function(e){
      var formEvent=e.original.target.form;
      console.log(e);
      cal.method.reset.apply(cal);
      console.log('search',cal);
      firebaseRef.set('');
      ref.set('');
      var date=ractive.get('input.date')
      if(!date){
        date='2016-03-01';
      }
      var year = formEvent[2].value;
      var month = dateType(formEvent[3].value);
      var day = dateType(formEvent[4].value);
      date = year + '-' + month + '-' + day;
      console.log('date',date);
      var query='?fields=posts.since('+date+').limit(1)%7Bcomments.limit(300).summary(true)%2Clikes.limit(1000).summary(true)%2Cshares%2Cmessage%7D';
      ractive.set('show','inline-block')
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
function dateType(num){
  if(num.length<2){
    num='0'+num;
  }
  return num;
}
