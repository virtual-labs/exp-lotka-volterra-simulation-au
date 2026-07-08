const P={a:0.04,b:0.0005,c:0.2,e:0.1};
let sim=null,anim=null,frame=0;
function g(id){return +document.getElementById(id).value;}
function integrate(){
  const R=[g('ratPop')],S=[g('snakePop')],n=Math.round(g('steps')),h=g('stepSize'),T=[0];
  const fR=(r,s)=>P.a*r-P.b*r*s, fS=(s,r)=>P.e*P.b*r*s-P.c*s;
  for(let i=0;i<n;i++){const A=R[i],B=S[i];
    const k1a=fR(A,B),k1b=fS(B,A);
    const k2a=fR(A+.5*h*k1a,B+.5*h*k1b),k2b=fS(B+.5*h*k1b,A+.5*h*k1a);
    const k3a=fR(A+.5*h*k2a,B+.5*h*k2b),k3b=fS(B+.5*h*k2b,A+.5*h*k2a);
    const k4a=fR(A+h*k3a,B+h*k3b),k4b=fS(B+h*k3b,A+h*k3a);
    R[i+1]=Math.max(0,A+h/6*(k1a+2*k2a+2*k3a+k4a));
    S[i+1]=Math.max(0,B+h/6*(k1b+2*k2b+2*k3b+k4b));
    T[i+1]=+((i+1)*h).toFixed(2);}
  return {R,S,T,n};
}
const chart=()=>document.getElementById('chart');
function drawChart(){
  if(!sim){Chart.draw(chart(),[]);return;}
  const m=document.getElementById('plotMode').value,t=document.getElementById('plotTitle');
  if(m==='phase'){Chart.draw(chart(),[{color:'#7d0130',data:sim.R.map((r,i)=>[r,sim.S[i]]),points:false}],{xlabel:'Rats (prey)',ylabel:'Snakes (predator)',ratio:0.5});setLegend([{color:'#7d0130',name:'Trajectory (Rats, Snakes)'}]);t.textContent='Rats vs Snakes (phase plane)';}
  else if(m==='rats'){Chart.draw(chart(),[{color:'#b50246',data:sim.T.map((tt,i)=>[tt,sim.R[i]]),points:false}],{xlabel:'Time',ylabel:'Rats (prey)',ratio:0.5});setLegend([{color:'#b50246',name:'Rats'}]);t.textContent='Rats population vs time';}
  else if(m==='snakes'){Chart.draw(chart(),[{color:'#0e7c86',data:sim.T.map((tt,i)=>[tt,sim.S[i]]),points:false}],{xlabel:'Time',ylabel:'Snakes (predator)',ratio:0.5});setLegend([{color:'#0e7c86',name:'Snakes'}]);t.textContent='Snakes population vs time';}
  else {Chart.draw(chart(),[{color:'#b50246',data:sim.T.map((tt,i)=>[tt,sim.R[i]]),points:false},{color:'#0e7c86',axis:'r',data:sim.T.map((tt,i)=>[tt,sim.S[i]]),points:false}],{xlabel:'Time',ylabel:'Rats (prey)',ylabelR:'Snakes (predator)',ratio:0.5});setLegend([{color:'#b50246',name:'Rats (left axis)'},{color:'#0e7c86',name:'Snakes (right axis)'}]);t.textContent='Rats & Snakes vs time (dual axis)';}
}
function drawField(i){
  if(!sim)return;const maxR=Math.max(...sim.R),maxS=Math.max(...sim.S);
  const nR=Math.min(150,Math.round(sim.R[i]/maxR*140)),nS=Math.min(150,Math.round(sim.S[i]/maxS*100));
  renderField('field',[{emoji:'🐀',count:nR},{emoji:'🐍',count:nS}]);
}
function info(i){document.getElementById('counts').innerHTML=sim?`Rats: <b>${Math.round(sim.R[i])}</b> &nbsp; Snakes: <b>${Math.round(sim.S[i])}</b> &nbsp; Time: <b>${sim.T[i]}</b>`:'';}
function run(){stopAnim();sim=integrate();frame=sim.n;drawChart();drawField(frame);info(frame);toast('Model integrated');}
function play(){if(!sim)run();if(anim){stopAnim();return;}document.getElementById('playBtn').textContent='Pause ⏸';let i=(frame>=sim.n)?0:frame;anim=setInterval(function(){if(i>sim.n){stopAnim();return;}frame=i;drawField(i);info(i);i++;},120);}
function stopAnim(){if(anim){clearInterval(anim);anim=null;}document.getElementById('playBtn').textContent='Play ▶';}
function step(){if(!sim)run();stopAnim();frame=(frame>=sim.n)?0:frame+1;drawField(frame);info(frame);}
function sync(){document.querySelectorAll('#simbox .val').forEach(function(v){var el=document.getElementById(v.id.slice(2));if(el)v.textContent=el.value;});}
const D={ratPop:4095,snakePop:347,steps:500,stepSize:1};
function resetSim(){stopAnim();for(const k in D)document.getElementById(k).value=D[k];document.getElementById('plotMode').value='phase';sync();sim=null;frame=0;Chart.draw(chart(),[]);document.getElementById('legend').innerHTML='';document.getElementById('counts').textContent='';renderField('field',[]);toast('Reset');}
function downloadCSV(){if(!sim){toast('Run first');return;}let csv='time,rats,snakes\n';for(let i=0;i<=sim.n;i++)csv+=sim.T[i]+','+sim.R[i]+','+sim.S[i]+'\n';dl(csv,'lotka-volterra.csv','text/csv');toast('CSV downloaded');}
sync();window.addEventListener('resize',function(){if(sim){drawChart();drawField(frame);}});
