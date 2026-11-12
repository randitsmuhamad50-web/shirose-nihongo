import sys,re,json
# usage: fix4.py pack.txt dict.json  -> replace the 2 wrong options of section-4 items keyed by stimulus text
f=sys.argv[1]; d=json.load(open(sys.argv[2],encoding='utf-8'))
L=open(f,encoding='utf-8').read().split('\n'); in4=False; n=0
for i,l in enumerate(L):
    if l.startswith('== '): in4=(l=='== 4')
    if in4 and re.match(r'^(M|F):',l):
        k=l[2:].strip()
        if k in d and L[i+1].startswith('O '):
            o=L[i+1][2:].split(' / '); L[i+1]='O '+o[0]+' / '+d[k][0]+' / '+d[k][1]; n+=1
open(f,'w',encoding='utf-8').write('\n'.join(L)); print(f,n,'fixed of',len(d))
