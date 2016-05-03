function Calculation(){
  var self=this;

  self.data={
    likes_total : 0,
    likes_name : [],
    likes_id : [],
    comments_total : 0,
    comments_name : [],
    comments_id : []
  };
  self.method={
    addLikes : addLikes,
    addComments : addComments,
    reset:reset
  };

}
function addLikes(){
  //console.log('addLikes',this);
  //console.log(arguments);
  for(key in arguments){
    if(this.data.likes_id.indexOf(arguments[key].id)<0){
      this.data.likes_total++;
      this.data.likes_id.push(arguments[key].id);
      this.data.likes_name.push(arguments[key].name);
    }
  }

}
function addComments(info){
  //console.log('addLikes',this);
  //console.log(arguments);
  for(key in arguments){
    if(this.data.comments_id.indexOf(arguments[key].from.id)<0){
      this.data.comments_total++;
      this.data.comments_id.push(arguments[key].from.id);
      this.data.comments_name.push(arguments[key].from.name);
    }
  }

}
function reset(){
  this.data={
    likes_total : 0,
    likes_name : [],
    likes_id : [],
    comments_total : 0,
    comments_name : [],
    comments_id : []
  };
}
