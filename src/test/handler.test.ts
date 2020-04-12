import handler from '../lib/service';

var test = async() => {
    // await handler.log({
    //     from: {
    //         fromId: 123
    //     },
    //     room: {
    //         room: 'king'
    //     },
    //     text: '这是一段测试'
    // });
    console.log(handler);
    await handler.addRule('');
};
test();
