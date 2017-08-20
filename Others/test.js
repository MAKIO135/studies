var a = 3.2;
console.log('a', a, a.toString(2));
for(i=0;i<2;i+=1/16){

    console.log( i+'\t', i % 1)
}

console.log( new Array(209).fill(0).map( d => Math.random()*2|0 ).join(''))
