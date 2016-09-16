import avalonbox from '../../src/scripts/avalonbox';
import highlight from 'highlight.js'


document.onreadystatechange = function(){
  if(document.readyState === 'complete'){

    highlight.fixMarkup();
    highlight.initHighlightingOnLoad();
    avalonbox.run('image-gallery-single');
    avalonbox.run('image-gallery-multiple');
    avalonbox.run('image-gallery-many');
  }
}
