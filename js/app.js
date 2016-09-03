import avalonbox from '../../src/avalonbox';

document.onreadystatechange = function(){
  if(document.readyState === 'complete'){
    avalonbox.init('#image-gallery');
  }
}
