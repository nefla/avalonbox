import avalonbox from '../../src/scripts/avalon_box';

document.onreadystatechange = function(){
  if(document.readyState === 'complete'){
    avalonbox.init('#image-gallery');
  }
}
