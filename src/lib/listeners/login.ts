/**
 * @description 您的机器人上线啦
 * @param {} user 
 */
async function onLogin(user: any) {
  console.log(`贴心小助理${user}登录了`);
  //创建定时发送群消息任务
//   await onRoom();
}
/**
 * 9点定时给指定群发送消息
 */
async function onRoom() {
    const time = '0 0 9 * * *';
    // schedule.setSchedule(time, async () => {
    //     const room = await bot.Room.find({
    //     topic: config.WEBROOM
    //     })
    //     let today = await untils.formatDate(new Date()) //获取今天的日期
    //     let one = await superagent.getOne() //获取每日一句
    //     const englishData = await superagent.getEnglishOne(); //英语一句话
    //     let english = `en：${englishData.en}<br>zh：${englishData.zh}`
    //     let poison = await superagent.getPoison(); //毒鸡汤
    //     const str = `${today}<br>元气满满的一天开始啦,要加油噢^_^<br><br>每日一句：<br>${one}<br><br>英语一句话：<br>${english}<br><br>毒鸡汤：<br>${poison}`
    //     await room.say(str);
    // })
}
  
export default onLogin;