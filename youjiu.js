//有酒你有故事吗
const fs = require("fs");
const crawler=require("crawler");
const cheerio = require("cheerio")
const Config = {
    // 更换爬取书籍只需要修改url
    //书的目录地址
    url:"http://www.youjiuniyougushima.com/book/VFYBCQgI.html",
    //输出文件   （请保证能找到该文件且建议该文件为空）
    outFile:"./data/",
    //若书内容地址与目录地址无关联，则用下面内容头地址
    baseUrl:"http://www.youjiuniyougushima.com",
}


getCatalog()
function getCatalog(){
    var Catalog = new crawler({
        encoding:null,
        jQuery:false,
        callback:function(err,res,done){
            if(err){
                console.log(err);
                return;
            }
            //获取文本并且解析
            let $ = cheerio.load(res.body.toString())
            //书的名字
            Config.outFile = Config.outFile+$(".info .col-xs-12").text()+'.txt';
            //创建书名文件
            fs.writeFile(Config.outFile, '', (err) => {
                if (err) {console.log(err);return;}
                console.log(`创建文件成功`);
            })
            //目录数组
            let arr = []
            $(".booklist .row .col-sm-12 .list-group a").each((i,e) => {
                //书的地址
                let href = $(e).attr("href")
                let json = {
                    href,
                    //标题
                    title:$(e).text()
                }
                arr.push(json)
            })
            //获取数据
            getPage(arr,0,arr.length)
        }
    });
    
    Catalog.queue({
        //书目录地址
        url:Config.url,
        //模仿客户端访问
        headers:{'User-Agent': 'requests'},
    })
}

function getPage(arr,idx,len) {
    if(idx >= len) {
        console.log('爬书完成！');
        return
    }
    var page = new crawler({
        encoding:null,
        jQuery:false,
        callback:function(err,res,done){
            if(err){
                console.log(err);
                return;
            }
            let $ = cheerio.load(res.body.toString())
            //把标题加入到每一张的前面
            let info = "\n" + arr[idx].title + '\n' + $("#content .content").text()
            info = info.replace(/\s\s\s\s/g, '\n'); //将四个连续的空格符替换为换行
            fs.appendFile(Config.outFile,info,function(e) {
                if(e) return
                //输出当前状态
                console.log("已完成：" + arr[idx].title);
                //递归调用本函数以获取下一章内容
                getPage(arr,idx+1,len)
            })
        }
    });
    page.queue({
        url:Config.baseUrl+arr[idx].href,
        headers:{'User-Agent': 'requests'},
    })
}