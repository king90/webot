  import { Friendship } from 'wechaty';

  /**
   * 自动同意好友请求
   */
async function onFriendship(friendship: Friendship) {
    if (friendship.type() === Friendship.Type.Receive) {
        console.log('onFriendship: ', friendship.type());
        // await friendship.accept();
    }
}
export default onFriendship;