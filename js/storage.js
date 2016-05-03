function Storage(){
  var self=this;

  self.post=[];

  self.method={
    pushPost:pushPost,
    resetPost:resetPost
  }
}

function pushPost(newPost){
  this.post.push(newPost);
}
function resetPost(){
  this.post=[];
}
