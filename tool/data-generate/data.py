#生成 a+b 问题的生成10个输入输出的代码，为1.in,1.out....
import random
import os
for i in range(10):
    a = random.randint(1,100)
    b = random.randint(1,100)
    print(a,b)
    print(a+b)
    path = r"E:\workbench\code\web\demo\oj\agoj\agoj-front-admin\tool\data-generate\temp\data1"
    # 确保目录存在
    os.makedirs(path, exist_ok=True)
    
    with open(os.path.join(path,str(i)+".in"),'w') as f:
        f.write(str(a)+" "+str(b)+"\n")
    with open(os.path.join(path,str(i)+".out"),'w') as f:
        f.write(str(a+b)+"\n")
    

