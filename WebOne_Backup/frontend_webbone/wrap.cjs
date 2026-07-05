const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

// The layout was:
//           </div> {/* closes config box */}
//       </div> {/* closes original grid */}
//       </div> {/* End of Left Column */}
//
// We want to remove the 'closes original grid' div and the 'End of Left Column' div.
// Basically, we can just replace the block:
//           </div>
//         </div>
//       </div> {/* End of Left Column */}
// with:
//           </div>
//         </div> {/* End of Left Column */}

content = content.replace(/<\/div>\s*<\/div>\s*\{\/\* End of Left Column \*\/\}/, '</div>\n        </div> {/* End of Left Column */}');

// And remove the </div> {/* End of 2-Column Layout */} because it closes the root container?
// No, the 2-Column Layout grid NEEDS to be closed. But if the closes original grid div was already removed...
// Wait, let's just use a naive approach: wrap the whole return inside a <> </> Fragment!
content = content.replace(/return \(\s*<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">/, 'return (<>\n<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">');
content = content.replace(/<\/div><\/div><\/div><\/div>\s*\);\s*\}/, '</div>\n</>\n  );}');

fs.writeFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', content);
console.log('Applied Fragment wrap');
