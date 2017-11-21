function Datasource(t){this.dsName=t.getString(),this.dsType=t.getString(),this.heartbeat=t.getLong(),this.minValue=t.getDouble(),this.maxValue=t.getDouble(),this.lastValue=t.getDouble(),this.accumValue=t.getDouble(),this.nanSeconds=t.getLong()}function Archive(t){this.consolFun=t.getString(),this.xff=t.getDouble(),this.steps=t.getInt(),this.rows=t.getInt(),this.headerStep=t.step,this.headerLastUpdateTime=t.lastUpdateTime,this.robins=[];for(var e=0;e<t.dsCount;e++){var i=t.getInt(),s=new ArcState(t);this.robins.push(new RobinMatrix(i,s,this.rows))}for(var r=0;r<this.rows;r++)for(e=0;e<t.dsCount;e++)this.robins[e].data.push(t.getDouble())}function normalize(t,e){return t-t%e}function RobinMatrix(t,e,i){this.pointer=t,this.arcState=e,this.rows=i,this.data=[]}function ArcState(t){this.accumValue=t.getDouble(),this.nanSteps=t.getLong()}Archive.prototype.getArcStep=function(){return this.headerStep*this.steps},Archive.prototype.getStartTime=function(){var t=this.getEndTime(),e=this.getArcStep();return t-(this.rows-1)*e},Archive.prototype.getEndTime=function(){return normalize(this.headerLastUpdateTime,this.getArcStep())},Archive.prototype.getData=function(t,e,i){var s=this.getArcStep(),r=normalize(e,s),n=normalize(i,s);n<i&&(n+=s);var a=this.getStartTime(),o=this.getEndTime(),h=(n-r)/s+1,u=Math.max(r,a),g=Math.min(n,o),c=[];if(u<=g){var l=(g-u)/s+1,p=(u-a)/s;c=this.robins[t].getValues(p,l)}for(var d=[],f=0;f<h;f++){var v=r+f*s,m=NaN;v>=u&&v<=g&&(m=c[(v-u)/s]),d.push([1e3*(r+f*s),m])}return d},RobinMatrix.prototype.getValues=function(t,e){var i=(this.pointer+t)%this.rows,s=Math.min(this.rows-i,e),r=this.data.slice(i,i+s);if(s<e){var n=e-s,a=this.data.slice(0,0+n);return r.concat(a)}return r};var RRDFile=function(t){this.data=t,this.index=0,this.signature=this.getString(),this.step=this.getLong(),this.dsCount=this.getInt(),this.arcCount=this.getInt(),this.lastUpdateTime=this.getLong(),this.datasources=[];for(var e=0;e<this.dsCount;e++)this.datasources.push(new Datasource(this));for(this.archives=[],e=0;e<this.arcCount;e++)this.archives.push(new Archive(this))};RRDFile.prototype.getData=function(t,e,i,s){var r=this.getDsIndex(t),n=this.getArchive(e,i/1e3,s/1e3);if(-1===r||null===n)return{};return{label:t,data:n.getData(r,i/1e3,s/1e3)}},RRDFile.prototype.getArchive=function(t,e,i){for(var s=null,r=null,n=0,a=0,o=0;o<this.arcCount;o++){var h=this.archives[o];if(h.consolFun===t){var u=h.getArcStep(),g=h.getStartTime()-u,c=i-e,l=Math.abs(h.getArcStep()-1);if(g<=e)(null==s||l<n)&&(n=l,s=h);else{var p=c;g>e&&(p-=g-e),(null===r||a<p||a===p&&l<n)&&(r=h,a=p)}}}return null!=s?s:null!=r?r:null},RRDFile.prototype.getDsIndex=function(t){for(var e=0;e<this.dsCount;e++)if(t===this.datasources[e].dsName)return e;return-1},RRDFile.prototype.getString=function(){for(var t="",e=0;e<40;e+=2)t+=String.fromCharCode(this.data[this.index+e+1]);return this.index+=40,t.trim()},RRDFile.prototype.getDouble=function(){var t=new DataView(this.data.buffer,this.index,8).getFloat64(0,!1);return this.index+=8,t},RRDFile.prototype.getLong=function(){return(this.getInt()<<32)+(4294967295&this.getInt())},RRDFile.prototype.getInt=function(){var t=(this.data[this.index+0]<<24&4278190080)+(this.data[this.index+1]<<16&16711680)+(this.data[this.index+2]<<8&65280)+(this.data[this.index+3]<<0&255);return this.index+=4,t},RRDFile.prototype.skip=function(t){this.index+=t},module.exports=RRDFile;