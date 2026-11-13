import json,glob
d=json.load(open('data/kosakata-n4.json',encoding='utf8'))
n=0
for f in sorted(glob.glob('tools/kosakata_n4_audit_*.json')):
    for k,v in json.load(open(f,encoding='utf8')).items():
        d[int(k)-1]['arti']=v; n+=1
open('data/kosakata-n4.json','w',encoding='utf8').write(json.dumps(d,ensure_ascii=False,separators=(',',':')))
print(n)
d=json.load(open('data/kosakata-n4.json',encoding='utf8'))
for k,v in json.load(open('tools/kosakata_n4_fix_extra.json',encoding='utf8')).items():
    d[int(k)-1].update(v)
open('data/kosakata-n4.json','w',encoding='utf8').write(json.dumps(d,ensure_ascii=False,separators=(',',':')))
