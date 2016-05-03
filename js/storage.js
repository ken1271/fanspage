function Storage(){
  var self=this;

  self.post=[];

  self.method={
    pushPost:pushPost,
    resetPost:resetPost,
    getPost:getPost,
  }
}

function pushPost(){
  var newPost=arguments[0];
  this.post.push(newPost);
}
function resetPost(){
  this.post=[];
}
function getPost(){
  return this.post;
}
