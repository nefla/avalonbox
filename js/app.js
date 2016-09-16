import avalonbox from '../../src/scripts/avalonbox';
import prism from 'prismjs'


document.onreadystatechange = function(){
  if(document.readyState === 'complete'){

    avalonbox.run('image-gallery-single');
    avalonbox.run('image-gallery-multiple');
    avalonbox.run('image-gallery-many');
  }
}
