# react-native-GiftedList

A ListView or FlatList  with pull-to-refresh, infinite scrolling and more for Android and iOS React-Native apps



![](https://raw.githubusercontent.com/FaridSafi/react-native-gifted-listview/master/Captures/ios_refresh_page_demo.gif)
![](https://raw.githubusercontent.com/FaridSafi/react-native-gifted-listview/master/Captures/android_refresh_page_demo.gif)


## 安装

`npm install react-native-giftedlist` or `yarn add react-native-giftedlist`


## 使用


### Simple example


```js
var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ListView,
  FlatList,
} = React;
var createGiftedList = require('react-native-giftedlist');
const GiftedListView=createGiftedList(ListView);
//也可以使用 createGiftedList(FlatList)
var Example = React.createClass({

  /**
   * Will be called when refreshing
   * Should be replaced by your own logic
   * @param {number} page Requested page to fetch
   * @param {function} callback Should pass the rows
   * @param {object} options Inform if first load
   */
  _onFetch(page = 1, callback, options) {
    setTimeout(() => {
      var rows = ['row '+((page - 1) * 3 + 1), 'row '+((page - 1) * 3 + 2), 'row '+((page - 1) * 3 + 3)];
      if (page === 3) {
        callback(rows, {
          allLoaded: true, // the end of the list is reached
        });
      } else {
        callback(rows);
      }
    }, 1000); // simulating network fetching
  },


  /**
   * When a row is touched
   * @param {object} rowData Row data
   */
  _onPress(rowData) {
    console.log(rowData+' pressed');
  },

  /**
   * Render a row
   * @param {object} rowData Row data
   */
  _renderRowView(rowData) {
    return (
      <TouchableHighlight
        style={styles.row}
        underlayColor='#c8c7cc'
        onPress={() => this._onPress(rowData)}
      >
        <Text>{rowData}</Text>
      </TouchableHighlight>
    );
  },

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.navBar} />
        <GiftedListView
          rowView={this._renderRowView}
          onFetch={this._onFetch}
          firstLoader={true} // display a loader for the first fetching
          pagination={true} // enable infinite scrolling using touch to load more
          refreshable={true} // enable pull-to-refresh for iOS and touch-to-refresh for Android
          withSections={false} // enable sections
          customStyles={{
            paginationView: {
              backgroundColor: '#eee',
            },
          }}

          refreshableTintColor="blue"
        />
      </View>
    );
  }
});

var styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  navBar: {
    height: 64,
    backgroundColor: '#CCC'
  },
  row: {
    padding: 10,
    height: 44,
  },
};
```
