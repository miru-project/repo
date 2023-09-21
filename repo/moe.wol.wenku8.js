// ==MiruExtension==
// @name         轻小说文库
// @version      v0.0.1
// @author       NPGamma
// @lang         zh-cn
// @icon         https://www.wenku8.net/favicon.ico
// @license      AGPL-3.0
// @package      moe.wol.wenku8
// @type         fikushon
// @webSite      https://www.wenku8.net
// ==/MiruExtension==

/* fast-xml-parser to parse xml data */
/* MIT License Copyright (c) 2017 Amit Kumar Gupta */
/* https://github.com/NaturalIntelligence/fast-xml-parser */
var XMLParser;(()=>{var t={807:t=>{const e=/^[-+]?0x[a-fA-F0-9]+$/,r=/^([\-\+])?(0*)(\.[0-9]+([eE]\-?[0-9]+)?|[0-9]+(\.[0-9]+([eE]\-?[0-9]+)?)?)$/;!Number.parseInt&&window.parseInt&&(Number.parseInt=window.parseInt),!Number.parseFloat&&window.parseFloat&&(Number.parseFloat=window.parseFloat);const i={hex:!0,leadingZeros:!0,decimalPoint:".",eNotation:!0};t.exports=function(t,n={}){if(n=Object.assign({},i,n),!t||"string"!=typeof t)return t;let a=t.trim();if(void 0!==n.skipLike&&n.skipLike.test(a))return t;if(n.hex&&e.test(a))return Number.parseInt(a,16);{const e=r.exec(a);if(e){const r=e[1],i=e[2];let o=(s=e[3])&&-1!==s.indexOf(".")?("."===(s=s.replace(/0+$/,""))?s="0":"."===s[0]?s="0"+s:"."===s[s.length-1]&&(s=s.substr(0,s.length-1)),s):s;const l=e[4]||e[6];if(!n.leadingZeros&&i.length>0&&r&&"."!==a[2])return t;if(!n.leadingZeros&&i.length>0&&!r&&"."!==a[1])return t;{const e=Number(a),s=""+e;return-1!==s.search(/[eE]/)||l?n.eNotation?e:t:-1!==a.indexOf(".")?"0"===s&&""===o||s===o||r&&s==="-"+o?e:t:i?o===s||r+o===s?e:t:a===s||a===r+s?e:t}}return t}var s}},839:(t,e)=>{"use strict";var r="[:A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*",i=new RegExp("^"+r+"$");e.isExist=function(t){return void 0!==t},e.isEmptyObject=function(t){return 0===Object.keys(t).length},e.merge=function(t,e,r){if(e)for(var i=Object.keys(e),n=i.length,a=0;a<n;a++)t[i[a]]="strict"===r?[e[i[a]]]:e[i[a]]},e.getValue=function(t){return e.isExist(t)?t:""},e.isName=function(t){return!(null==i.exec(t))},e.getAllMatches=function(t,e){for(var r=[],i=e.exec(t);i;){var n=[];n.startIndex=e.lastIndex-i[0].length;for(var a=i.length,s=0;s<a;s++)n.push(i[s]);r.push(n),i=e.exec(t)}return r},e.nameRegexp=r},239:(t,e,r)=>{"use strict";var i=r(839),n={allowBooleanAttributes:!1,unpairedTags:[]};function a(t){return" "===t||"\t"===t||"\n"===t||"\r"===t}function s(t,e){for(var r=e;e<t.length;e++)if("?"!=t[e]&&" "!=t[e]);else{var i=t.substr(r,e-r);if(e>5&&"xml"===i)return d("InvalidXml","XML declaration allowed only at the start of the document.",p(t,e));if("?"==t[e]&&">"==t[e+1]){e++;break}}return e}function o(t,e){if(t.length>e+5&&"-"===t[e+1]&&"-"===t[e+2]){for(e+=3;e<t.length;e++)if("-"===t[e]&&"-"===t[e+1]&&">"===t[e+2]){e+=2;break}}else if(t.length>e+8&&"D"===t[e+1]&&"O"===t[e+2]&&"C"===t[e+3]&&"T"===t[e+4]&&"Y"===t[e+5]&&"P"===t[e+6]&&"E"===t[e+7]){var r=1;for(e+=8;e<t.length;e++)if("<"===t[e])r++;else if(">"===t[e]&&0==--r)break}else if(t.length>e+9&&"["===t[e+1]&&"C"===t[e+2]&&"D"===t[e+3]&&"A"===t[e+4]&&"T"===t[e+5]&&"A"===t[e+6]&&"["===t[e+7])for(e+=8;e<t.length;e++)if("]"===t[e]&&"]"===t[e+1]&&">"===t[e+2]){e+=2;break}return e}function l(t,e){for(var r="",i="",n=!1;e<t.length;e++){if('"'===t[e]||"'"===t[e])""===i?i=t[e]:i!==t[e]||(i="");else if(">"===t[e]&&""===i){n=!0;break}r+=t[e]}return""===i&&{value:r,index:e,tagClosed:n}}e.validate=function(t,e){e=Object.assign({},n,e);var r,u=[],h=!1,c=!1;"\ufeff"===t[0]&&(t=t.substr(1));for(var v=0;v<t.length;v++)if("<"===t[v]&&"?"===t[v+1]){if((v=s(t,v+=2)).err)return v}else{if("<"!==t[v]){if(a(t[v]))continue;return d("InvalidChar","char '"+t[v]+"' is not expected.",p(t,v))}var m=v;if("!"===t[++v]){v=o(t,v);continue}var x=!1;"/"===t[v]&&(x=!0,v++);for(var N="";v<t.length&&">"!==t[v]&&" "!==t[v]&&"\t"!==t[v]&&"\n"!==t[v]&&"\r"!==t[v];v++)N+=t[v];if("/"===(N=N.trim())[N.length-1]&&(N=N.substring(0,N.length-1),v--),r=N,!i.isName(r))return d("InvalidTag",0===N.trim().length?"Invalid space after '<'.":"Tag '"+N+"' is an invalid name.",p(t,v));var b=l(t,v);if(!1===b)return d("InvalidAttr","Attributes for '"+N+"' have open quote.",p(t,v));var E=b.value;if(v=b.index,"/"===E[E.length-1]){var T=v-E.length,w=f(E=E.substring(0,E.length-1),e);if(!0!==w)return d(w.err.code,w.err.msg,p(t,T+w.err.line));h=!0}else if(x){if(!b.tagClosed)return d("InvalidTag","Closing tag '"+N+"' doesn't have proper closing.",p(t,v));if(E.trim().length>0)return d("InvalidTag","Closing tag '"+N+"' can't have attributes or invalid starting.",p(t,m));var y=u.pop();if(N!==y.tagName){var O=p(t,y.tagStartPos);return d("InvalidTag","Expected closing tag '"+y.tagName+"' (opened in line "+O.line+", col "+O.col+") instead of closing tag '"+N+"'.",p(t,m))}0==u.length&&(c=!0)}else{var A=f(E,e);if(!0!==A)return d(A.err.code,A.err.msg,p(t,v-E.length+A.err.line));if(!0===c)return d("InvalidXml","Multiple possible root nodes found.",p(t,v));-1!==e.unpairedTags.indexOf(N)||u.push({tagName:N,tagStartPos:m}),h=!0}for(v++;v<t.length;v++)if("<"===t[v]){if("!"===t[v+1]){v=o(t,++v);continue}if("?"!==t[v+1])break;if((v=s(t,++v)).err)return v}else if("&"===t[v]){var I=g(t,v);if(-1==I)return d("InvalidChar","char '&' is not expected.",p(t,v));v=I}else if(!0===c&&!a(t[v]))return d("InvalidXml","Extra text at the end",p(t,v));"<"===t[v]&&v--}return h?1==u.length?d("InvalidTag","Unclosed tag '"+u[0].tagName+"'.",p(t,u[0].tagStartPos)):!(u.length>0)||d("InvalidXml","Invalid '"+JSON.stringify(u.map((function(t){return t.tagName})),null,4).replace(/\r?\n/g,"")+"' found.",{line:1,col:1}):d("InvalidXml","Start tag expected.",1)};var u=new RegExp("(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['\"])(([\\s\\S])*?)\\5)?","g");function f(t,e){for(var r=i.getAllMatches(t,u),n={},a=0;a<r.length;a++){if(0===r[a][1].length)return d("InvalidAttr","Attribute '"+r[a][2]+"' has no space in starting.",c(r[a]));if(void 0!==r[a][3]&&void 0===r[a][4])return d("InvalidAttr","Attribute '"+r[a][2]+"' is without value.",c(r[a]));if(void 0===r[a][3]&&!e.allowBooleanAttributes)return d("InvalidAttr","boolean attribute '"+r[a][2]+"' is not allowed.",c(r[a]));var s=r[a][2];if(!h(s))return d("InvalidAttr","Attribute '"+s+"' is an invalid name.",c(r[a]));if(n.hasOwnProperty(s))return d("InvalidAttr","Attribute '"+s+"' is repeated.",c(r[a]));n[s]=1}return!0}function g(t,e){if(";"===t[++e])return-1;if("#"===t[e])return function(t,e){var r=/\d/;for("x"===t[e]&&(e++,r=/[\da-fA-F]/);e<t.length;e++){if(";"===t[e])return e;if(!t[e].match(r))break}return-1}(t,++e);for(var r=0;e<t.length;e++,r++)if(!(t[e].match(/\w/)&&r<20)){if(";"===t[e])break;return-1}return e}function d(t,e,r){return{err:{code:t,msg:e,line:r.line||r,col:r.col}}}function h(t){return i.isName(t)}function p(t,e){var r=t.substring(0,e).split(/\r?\n/);return{line:r.length,col:r[r.length-1].length+1}}function c(t){return t.startIndex+t[1].length}},106:(t,e,r)=>{var i=r(839);function n(t,e){for(var r="";e<t.length&&"'"!==t[e]&&'"'!==t[e];e++)r+=t[e];if(-1!==(r=r.trim()).indexOf(" "))throw new Error("External entites are not supported");for(var i=t[e++],n="";e<t.length&&t[e]!==i;e++)n+=t[e];return[r,n,e]}function a(t,e){return"!"===t[e+1]&&"-"===t[e+2]&&"-"===t[e+3]}function s(t,e){return"!"===t[e+1]&&"E"===t[e+2]&&"N"===t[e+3]&&"T"===t[e+4]&&"I"===t[e+5]&&"T"===t[e+6]&&"Y"===t[e+7]}function o(t,e){return"!"===t[e+1]&&"E"===t[e+2]&&"L"===t[e+3]&&"E"===t[e+4]&&"M"===t[e+5]&&"E"===t[e+6]&&"N"===t[e+7]&&"T"===t[e+8]}function l(t,e){return"!"===t[e+1]&&"A"===t[e+2]&&"T"===t[e+3]&&"T"===t[e+4]&&"L"===t[e+5]&&"I"===t[e+6]&&"S"===t[e+7]&&"T"===t[e+8]}function u(t,e){return"!"===t[e+1]&&"N"===t[e+2]&&"O"===t[e+3]&&"T"===t[e+4]&&"A"===t[e+5]&&"T"===t[e+6]&&"I"===t[e+7]&&"O"===t[e+8]&&"N"===t[e+9]}function f(t){if(i.isName(t))return t;throw new Error("Invalid entity name "+t)}t.exports=function(t,e){var r={};if("O"!==t[e+3]||"C"!==t[e+4]||"T"!==t[e+5]||"Y"!==t[e+6]||"P"!==t[e+7]||"E"!==t[e+8])throw new Error("Invalid Tag instead of DOCTYPE");e+=9;for(var i=1,g=!1,d=!1;e<t.length;e++)if("<"!==t[e]||d)if(">"===t[e]){if(d?"-"===t[e-1]&&"-"===t[e-2]&&(d=!1,i--):i--,0===i)break}else"["===t[e]?g=!0:t[e];else{if(g&&s(t,e)){var h=n(t,(e+=7)+1);entityName=h[0],val=h[1],e=h[2],-1===val.indexOf("&")&&(r[f(entityName)]={regx:RegExp("&"+entityName+";","g"),val})}else if(g&&o(t,e))e+=8;else if(g&&l(t,e))e+=8;else if(g&&u(t,e))e+=9;else{if(!a)throw new Error("Invalid DOCTYPE");d=!0}i++}if(0!==i)throw new Error("Unclosed DOCTYPE");return{entities:r,i:e}}},348:(t,e)=>{var r={preserveOrder:!1,attributeNamePrefix:"@_",attributesGroupName:!1,textNodeName:"#text",ignoreAttributes:!0,removeNSPrefix:!1,allowBooleanAttributes:!1,parseTagValue:!0,parseAttributeValue:!1,trimValues:!0,cdataPropName:!1,numberParseOptions:{hex:!0,leadingZeros:!0,eNotation:!0},tagValueProcessor:function(t,e){return e},attributeValueProcessor:function(t,e){return e},stopNodes:[],alwaysCreateTextNode:!1,isArray:function(){return!1},commentPropName:!1,unpairedTags:[],processEntities:!0,htmlEntities:!1,ignoreDeclaration:!1,ignorePiTags:!1,transformTagName:!1,transformAttributeName:!1,updateTag:function(t,e,r){return t}};e.buildOptions=function(t){return Object.assign({},r,t)},e.defaultOptions=r},498:(t,e,r)=>{"use strict";var i=r(839),n=r(876),a=r(106),s=r(807);function o(t){for(var e=Object.keys(t),r=0;r<e.length;r++){var i=e[r];this.lastEntities[i]={regex:new RegExp("&"+i+";","g"),val:t[i]}}}function l(t,e,r,i,n,a,s){if(void 0!==t&&(this.options.trimValues&&!i&&(t=t.trim()),t.length>0)){s||(t=this.replaceEntitiesValue(t));var o=this.options.tagValueProcessor(e,t,r,n,a);return null==o?t:typeof o!=typeof t||o!==t?o:this.options.trimValues||t.trim()===t?b(t,this.options.parseTagValue,this.options.numberParseOptions):t}}function u(t){if(this.options.removeNSPrefix){var e=t.split(":"),r="/"===t.charAt(0)?"/":"";if("xmlns"===e[0])return"";2===e.length&&(t=r+e[1])}return t}"<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|((NAME:)?(NAME))([^>]*)>|((\\/)(NAME)\\s*>))([^<]*)".replace(/NAME/g,i.nameRegexp);var f=new RegExp("([^\\s=]+)\\s*(=\\s*(['\"])([\\s\\S]*?)\\3)?","gm");function g(t,e,r){if(!this.options.ignoreAttributes&&"string"==typeof t){for(var n=i.getAllMatches(t,f),a=n.length,s={},o=0;o<a;o++){var l=this.resolveNameSpace(n[o][1]),u=n[o][4],g=this.options.attributeNamePrefix+l;if(l.length)if(this.options.transformAttributeName&&(g=this.options.transformAttributeName(g)),"__proto__"===g&&(g="#__proto__"),void 0!==u){this.options.trimValues&&(u=u.trim()),u=this.replaceEntitiesValue(u);var d=this.options.attributeValueProcessor(l,u,e);s[g]=null==d?u:typeof d!=typeof u||d!==u?d:b(u,this.options.parseAttributeValue,this.options.numberParseOptions)}else this.options.allowBooleanAttributes&&(s[g]=!0)}if(!Object.keys(s).length)return;if(this.options.attributesGroupName){var h={};return h[this.options.attributesGroupName]=s,h}return s}}var d=function(t){t=t.replace(/\r\n?/g,"\n");for(var e=new n("!xml"),r=e,i="",s="",o=0;o<t.length;o++)if("<"===t[o])if("/"===t[o+1]){var l=m(t,">",o,"Closing Tag is not closed."),u=t.substring(o+2,l).trim();if(this.options.removeNSPrefix){var f=u.indexOf(":");-1!==f&&(u=u.substr(f+1))}this.options.transformTagName&&(u=this.options.transformTagName(u)),r&&(i=this.saveTextToParentTag(i,r,s));var g=s.substring(s.lastIndexOf(".")+1);if(u&&-1!==this.options.unpairedTags.indexOf(u))throw new Error("Unpaired tag can not be used as closing tag: </"+u+">");var d=0;g&&-1!==this.options.unpairedTags.indexOf(g)?(d=s.lastIndexOf(".",s.lastIndexOf(".")-1),this.tagsNodeStack.pop()):d=s.lastIndexOf("."),s=s.substring(0,d),r=this.tagsNodeStack.pop(),i="",o=l}else if("?"===t[o+1]){var h=x(t,o,!1,"?>");if(!h)throw new Error("Pi Tag is not closed.");if(i=this.saveTextToParentTag(i,r,s),this.options.ignoreDeclaration&&"?xml"===h.tagName||this.options.ignorePiTags);else{var p=new n(h.tagName);p.add(this.options.textNodeName,""),h.tagName!==h.tagExp&&h.attrExpPresent&&(p[":@"]=this.buildAttributesMap(h.tagExp,s,h.tagName)),this.addChild(r,p,s)}o=h.closeIndex+1}else if("!--"===t.substr(o+1,3)){var c=m(t,"--\x3e",o+4,"Comment is not closed.");if(this.options.commentPropName){var v,N=t.substring(o+4,c-2);i=this.saveTextToParentTag(i,r,s),r.add(this.options.commentPropName,[(v={},v[this.options.textNodeName]=N,v)])}o=c}else if("!D"===t.substr(o+1,2)){var b=a(t,o);this.docTypeEntities=b.entities,o=b.i}else if("!["===t.substr(o+1,2)){var E=m(t,"]]>",o,"CDATA is not closed.")-2,T=t.substring(o+9,E);if(i=this.saveTextToParentTag(i,r,s),this.options.cdataPropName){var w;r.add(this.options.cdataPropName,[(w={},w[this.options.textNodeName]=T,w)])}else{var y=this.parseTextData(T,r.tagname,s,!0,!1,!0);null==y&&(y=""),r.add(this.options.textNodeName,y)}o=E+2}else{var O=x(t,o,this.options.removeNSPrefix),A=O.tagName,I=O.tagExp,F=O.attrExpPresent,P=O.closeIndex;this.options.transformTagName&&(A=this.options.transformTagName(A)),r&&i&&"!xml"!==r.tagname&&(i=this.saveTextToParentTag(i,r,s,!1));var C=r;if(C&&-1!==this.options.unpairedTags.indexOf(C.tagname)&&(r=this.tagsNodeStack.pop(),s=s.substring(0,s.lastIndexOf("."))),A!==e.tagname&&(s+=s?"."+A:A),this.isItStopNode(this.options.stopNodes,s,A)){var D="";if(I.length>0&&I.lastIndexOf("/")===I.length-1)o=O.closeIndex;else if(-1!==this.options.unpairedTags.indexOf(A))o=O.closeIndex;else{var k=this.readStopNodeData(t,A,P+1);if(!k)throw new Error("Unexpected end of "+A);o=k.i,D=k.tagContent}var S=new n(A);A!==I&&F&&(S[":@"]=this.buildAttributesMap(I,s,A)),D&&(D=this.parseTextData(D,A,s,!0,F,!0,!0)),s=s.substr(0,s.lastIndexOf(".")),S.add(this.options.textNodeName,D),this.addChild(r,S,s)}else{if(I.length>0&&I.lastIndexOf("/")===I.length-1){"/"===A[A.length-1]?(A=A.substr(0,A.length-1),s=s.substr(0,s.length-1),I=A):I=I.substr(0,I.length-1),this.options.transformTagName&&(A=this.options.transformTagName(A));var _=new n(A);A!==I&&F&&(_[":@"]=this.buildAttributesMap(I,s,A)),this.addChild(r,_,s),s=s.substr(0,s.lastIndexOf("."))}else{var M=new n(A);this.tagsNodeStack.push(r),A!==I&&F&&(M[":@"]=this.buildAttributesMap(I,s,A)),this.addChild(r,M,s),r=M}i="",o=P}}else i+=t[o];return e.child};function h(t,e,r){var i=this.options.updateTag(e.tagname,r,e[":@"]);!1===i||("string"==typeof i?(e.tagname=i,t.addChild(e)):t.addChild(e))}var p=function(t){if(this.options.processEntities){for(var e in this.docTypeEntities){var r=this.docTypeEntities[e];t=t.replace(r.regx,r.val)}for(var i in this.lastEntities){var n=this.lastEntities[i];t=t.replace(n.regex,n.val)}if(this.options.htmlEntities)for(var a in this.htmlEntities){var s=this.htmlEntities[a];t=t.replace(s.regex,s.val)}t=t.replace(this.ampEntity.regex,this.ampEntity.val)}return t};function c(t,e,r,i){return t&&(void 0===i&&(i=0===Object.keys(e.child).length),void 0!==(t=this.parseTextData(t,e.tagname,r,!1,!!e[":@"]&&0!==Object.keys(e[":@"]).length,i))&&""!==t&&e.add(this.options.textNodeName,t),t=""),t}function v(t,e,r){var i="*."+r;for(var n in t){var a=t[n];if(i===a||e===a)return!0}return!1}function m(t,e,r,i){var n=t.indexOf(e,r);if(-1===n)throw new Error(i);return n+e.length-1}function x(t,e,r,i){void 0===i&&(i=">");var n=function(t,e,r){var i;void 0===r&&(r=">");for(var n="",a=e;a<t.length;a++){var s=t[a];if(i)s===i&&(i="");else if('"'===s||"'"===s)i=s;else if(s===r[0]){if(!r[1])return{data:n,index:a};if(t[a+1]===r[1])return{data:n,index:a}}else"\t"===s&&(s=" ");n+=s}}(t,e+1,i);if(n){var a=n.data,s=n.index,o=a.search(/\s/),l=a,u=!0;if(-1!==o&&(l=a.substr(0,o).replace(/\s\s*$/,""),a=a.substr(o+1)),r){var f=l.indexOf(":");-1!==f&&(u=(l=l.substr(f+1))!==n.data.substr(f+1))}return{tagName:l,tagExp:a,closeIndex:s,attrExpPresent:u}}}function N(t,e,r){for(var i=r,n=1;r<t.length;r++)if("<"===t[r])if("/"===t[r+1]){var a=m(t,">",r,e+" is not closed");if(t.substring(r+2,a).trim()===e&&0==--n)return{tagContent:t.substring(i,r),i:a};r=a}else if("?"===t[r+1])r=m(t,"?>",r+1,"StopNode is not closed.");else if("!--"===t.substr(r+1,3))r=m(t,"--\x3e",r+3,"StopNode is not closed.");else if("!["===t.substr(r+1,2))r=m(t,"]]>",r,"StopNode is not closed.")-2;else{var s=x(t,r,">");s&&((s&&s.tagName)===e&&"/"!==s.tagExp[s.tagExp.length-1]&&n++,r=s.closeIndex)}}function b(t,e,r){if(e&&"string"==typeof t){var n=t.trim();return"true"===n||"false"!==n&&s(t,r)}return i.isExist(t)?t:""}t.exports=function(t){this.options=t,this.currentNode=null,this.tagsNodeStack=[],this.docTypeEntities={},this.lastEntities={apos:{regex:/&(apos|#39|#x27);/g,val:"'"},gt:{regex:/&(gt|#62|#x3E);/g,val:">"},lt:{regex:/&(lt|#60|#x3C);/g,val:"<"},quot:{regex:/&(quot|#34|#x22);/g,val:'"'}},this.ampEntity={regex:/&(amp|#38|#x26);/g,val:"&"},this.htmlEntities={space:{regex:/&(nbsp|#160);/g,val:" "},cent:{regex:/&(cent|#162);/g,val:"¢"},pound:{regex:/&(pound|#163);/g,val:"£"},yen:{regex:/&(yen|#165);/g,val:"¥"},euro:{regex:/&(euro|#8364);/g,val:"€"},copyright:{regex:/&(copy|#169);/g,val:"©"},reg:{regex:/&(reg|#174);/g,val:"®"},inr:{regex:/&(inr|#8377);/g,val:"₹"}},this.addExternalEntities=o,this.parseXml=d,this.parseTextData=l,this.resolveNameSpace=u,this.buildAttributesMap=g,this.isItStopNode=v,this.replaceEntitiesValue=p,this.readStopNodeData=N,this.saveTextToParentTag=c,this.addChild=h}},870:(t,e,r)=>{var i=r(348).buildOptions,n=r(498),a=r(400).prettify,s=r(239),o=function(){function t(t){this.externalEntities={},this.options=i(t)}var e=t.prototype;return e.parse=function(t,e){if("string"==typeof t);else{if(!t.toString)throw new Error("XML data is accepted in String or Bytes[] form.");t=t.toString()}if(e){!0===e&&(e={});var r=s.validate(t,e);if(!0!==r)throw Error(r.err.msg+":"+r.err.line+":"+r.err.col)}var i=new n(this.options);i.addExternalEntities(this.externalEntities);var o=i.parseXml(t);return this.options.preserveOrder||void 0===o?o:a(o,this.options)},e.addEntity=function(t,e){if(-1!==e.indexOf("&"))throw new Error("Entity value can't have '&'");if(-1!==t.indexOf("&")||-1!==t.indexOf(";"))throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");if("&"===e)throw new Error("An entity with value '&' is not permitted");this.externalEntities[t]=e},t}();t.exports=o},400:(t,e)=>{"use strict";function r(t,e,s){for(var o,l={},u=0;u<t.length;u++){var f,g=t[u],d=i(g);if(f=void 0===s?d:s+"."+d,d===e.textNodeName)void 0===o?o=g[d]:o+=""+g[d];else{if(void 0===d)continue;if(g[d]){var h=r(g[d],e,f),p=a(h,e);g[":@"]?n(h,g[":@"],f,e):1!==Object.keys(h).length||void 0===h[e.textNodeName]||e.alwaysCreateTextNode?0===Object.keys(h).length&&(e.alwaysCreateTextNode?h[e.textNodeName]="":h=""):h=h[e.textNodeName],void 0!==l[d]&&l.hasOwnProperty(d)?(Array.isArray(l[d])||(l[d]=[l[d]]),l[d].push(h)):e.isArray(d,f,p)?l[d]=[h]:l[d]=h}}}return"string"==typeof o?o.length>0&&(l[e.textNodeName]=o):void 0!==o&&(l[e.textNodeName]=o),l}function i(t){for(var e=Object.keys(t),r=0;r<e.length;r++){var i=e[r];if(":@"!==i)return i}}function n(t,e,r,i){if(e)for(var n=Object.keys(e),a=n.length,s=0;s<a;s++){var o=n[s];i.isArray(o,r+"."+o,!0,!0)?t[o]=[e[o]]:t[o]=e[o]}}function a(t,e){var r=e.textNodeName,i=Object.keys(t).length;return 0===i||!(1!==i||!t[r]&&"boolean"!=typeof t[r]&&0!==t[r])}e.prettify=function(t,e){return r(t,e)}},876:t=>{"use strict";var e=function(){function t(t){this.tagname=t,this.child=[],this[":@"]={}}var e=t.prototype;return e.add=function(t,e){var r;"__proto__"===t&&(t="#__proto__"),this.child.push(((r={})[t]=e,r))},e.addChild=function(t){var e,r;"__proto__"===t.tagname&&(t.tagname="#__proto__"),t[":@"]&&Object.keys(t[":@"]).length>0?this.child.push(((e={})[t.tagname]=t.child,e[":@"]=t[":@"],e)):this.child.push(((r={})[t.tagname]=t.child,r))},t}();t.exports=e}},e={},r=function r(i){var n=e[i];if(void 0!==n)return n.exports;var a=e[i]={exports:{}};return t[i](a,a.exports,r),a.exports}(870);XMLParser=r})();

export default class extends Extension {
    async latest(page) {
        const req = this.generate_encrypted_body(`action=novellist&sort=lastupdate&page=${page}&t=0`)
        const resp = await this.req(req)
        const parser = new this.XMLParser({ignoreAttributes: false})
        const dom = parser.parse(await resp.text())
        const results = []
        for (const item of dom.result.item) {
            const aid = item["@_aid"]
            const statusCode = parseInt(parseInt(aid) / 1000)
            const title = item.data.find(function (data) {return data["@_name"] == "Title"})["#text"].toString()
            const url = aid
            const cover = `https://img.wenku8.com/image/${statusCode}/${aid}/${aid}s.jpg`
            const update = item.data.find(function (data) {return data["@_name"] == "LastUpdate"})["@_value"]
            results.push({title, url, cover, update})
        }
        return results
    }

    async popular(page) {
        const req = this.generate_encrypted_body(`action=novellist&sort=allVisit&page=${page}&t=0`)
        const resp = await this.req(req)
        const parser = new this.XMLParser({ignoreAttributes: false})
        const dom = parser.parse(await resp.text())
        const results = []
        for (const item of dom.result.item) {
            const aid = item["@_aid"]
            const statusCode = parseInt(parseInt(aid) / 1000)
            const title = item.data.find(function (data) {return data["@_name"] == "Title"})["#text"].toString()
            const url = aid
            const cover = `https://img.wenku8.com/image/${statusCode}/${aid}/${aid}s.jpg`
            const update = item.data.find(function (data) {return data["@_name"] == "LastUpdate"})["@_value"]
            results.push({title, url, cover, update})
        }
        return results
    }

    async search(kw, page) {
        if (page > 1) {
            return []
        }
        const results = []
        const parser = new this.XMLParser({ignoreAttributes: false})
        for (const type of ["articlename", "author"]) {
            const req = this.generate_encrypted_body(`action=search&searchtype=${type}&searchkey=${kw}&t=0`)
            const resp = await this.req(req)
            const dom = parser.parse(await resp.text())
            if (dom?.result == "" || dom?.result == undefined) {
                continue
            }
            if (dom?.result?.item?.length == undefined) {
                const item = dom.result.item
                const aid = item["@_aid"]
                const statusCode = parseInt(parseInt(aid) / 1000)
                const title = item.data.find(function (data) {return data["@_name"] == "Title"})["#text"].toString()
                const url = aid
                const cover = `https://img.wenku8.com/image/${statusCode}/${aid}/${aid}s.jpg`
                const update = item.data.find(function (data) {return data["@_name"] == "LastUpdate"})["@_value"]
                results.push({title, url, cover, update})
                }
            else {
                for (const item of dom.result.item) {
                    const aid = item["@_aid"]
                    const statusCode = parseInt(parseInt(aid) / 1000)
                    const title = item.data.find(function (data) {return data["@_name"] == "Title"})["#text"].toString()
                    const url = aid
                    const cover = `https://img.wenku8.com/image/${statusCode}/${aid}/${aid}s.jpg`
                    const update = item.data.find(function (data) {return data["@_name"] == "LastUpdate"})["@_value"]
                    results.push({title, url, cover, update})
                }
            }
        }
        return results
    }

    async detail(url) {
        const parser = new this.XMLParser({ignoreAttributes: false})
        const aid = url
        const statusCode = parseInt(parseInt(aid) / 1000)
        const resp = await this.req(this.generate_encrypted_body(`action=book&do=info&aid=${aid}&t=0`))
        const dom = parser.parse(await resp.text())
        const title = dom.metadata.data.find(function (data) {return data["@_name"] == "Title"})["#text"]
        const cover = `https://img.wenku8.com/image/${statusCode}/${aid}/${aid}s.jpg`
        const desc = await (await this.req(this.generate_encrypted_body(`action=book&do=intro&aid=${aid}&t=0`))).text()
        const author = dom.metadata.data.find(function (data) {return data["@_name"] == "Author"})["@_value"]
        const episodes = []
        const episode_resp = await this.req(this.generate_encrypted_body(`action=book&do=list&aid=${aid}&t=0`))
        const episode_dom = parser.parse(await episode_resp.text())
        if (episode_dom?.package?.volume?.length == undefined) {
            const chapters = []
            const v_title = episode_dom.package.volume["#text"].toString()
            for (const chapter of episode_dom.package.volume.chapter) {
                const c_title = chapter["#text"].toString()
                const cid = chapter["@_cid"]
                const url = `${title}/#/${" "+c_title}/#/${aid}/#/${cid}`
                chapters.push({"name": c_title, "url": url})
            }
            episodes.push({"title": v_title, "urls": chapters})
        }
        else {
            for (const volume of episode_dom.package.volume) {
                const chapters = []
                const v_title = volume["#text"].toString()
                if (volume?.chapter?.length == undefined) {
                    const chapter = volume.chapter
                    if (chapter == undefined) {
                        continue
                    }
                    const c_title = chapter["#text"].toString()
                    const cid = chapter["@_cid"]
                    const url = `${title}/#/${" "+c_title}/#/${aid}/#/${cid}`
                    chapters.push({"name": c_title, "url": url})
                }
                else {
                    for (const chapter of volume.chapter) {
                        const c_title = chapter["#text"].toString()
                        const cid = chapter["@_cid"]
                        const url = `${title}/#/${" "+c_title}/#/${aid}/#/${cid}`
                        chapters.push({"name": c_title, "url": url})
                    }
                }
                episodes.push({"title": v_title, "urls": chapters})
            }
        }
        return {title, cover, desc, metadata: {"作者": author}, episodes}
    }
    
    async watch(url) {
        const title = url.split("/#/")[0]
        const subtitle = url.split("/#/")[1]
        const aid = url.split("/#/")[2]
        const cid = url.split("/#/")[3]
        const content = await (await this.req(this.generate_encrypted_body(`action=book&do=text&aid=${aid}&cid=${cid}&t=0`))).text()
        let contents = content.split("\n")
        if (content.includes("<!--image-->")) {
            contents = ["Miru暂不支持查看插图！"]
        }
        return {title, subtitle, "content": contents}
    }

    async load() {
        this.APPVER = "Wenku8-Extension-For-Miru v0.0.1(https://github.com/WorldObservationLog/miru-extensions)"
        this.XMLParser = XMLParser
    }

    async req(req) {
        var formBody = [];
        for (const property in req) {
            var encodedKey = encodeURI(property);
            var encodedValue = encodeURI(req[property])
            formBody.push(encodedKey + "=" + encodedValue)
        }
        formBody = formBody.join("&").replaceAll("%3D", "=")
        // Due to unknown reason, it can only use fetch here. DO NOT CHANGE IT
        return await fetch(
            "https://miru-wenku8.wol.moe/",
            {
                method: "POST",
                body: formBody
            }
        )
    }

generate_encrypted_body(raw_req) {
    return {"APPVER": this.APPVER,
        "request": CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(raw_req)),
        "timetoken": ""}
    }
}