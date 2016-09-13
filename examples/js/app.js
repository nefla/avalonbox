import avalonbox from '../../src/scripts/avalonbox';

document.onreadystatechange = function(){
  if(document.readyState === 'complete'){
    avalonbox.init('#image-gallery');
  }
}
