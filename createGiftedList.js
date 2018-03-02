'use strict'

var React = require('react');
var {
  ListView,
  Platform,
  TouchableHighlight,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  FlatList,
  Dimensions
} = require('react-native');
const {width:screenWidth,height:screenHeight}=Dimensions.get('window')
// small helper function which merged two objects into one
function MergeRecursive(obj1, obj2) {
  for (var p in obj2) {
    try {
      if (obj2[p].constructor == Object) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    } catch (e) {
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}

import PropTypes from 'prop-types'

const createReactClass = require('create-react-class');

const createGiftedList = (WrappedComponent) => {

  return class EnhancedComponent extends React.Component {

    constructor(props) {
      super(props);
      this._setPage(1);
      this._setRows([]);
      this._setComponentType(WrappedComponent.displayName)

      //

      var ds = null;
      if (props.withSections === true) {
        ds = new ListView.DataSource({
          rowHasChanged: props.rowHasChanged ? props.rowHasChanged : (row1, row2) => row1 !== row2,
          sectionHeaderHasChanged: (section1, section2) => section1 !== section2,
        });
        this.state = {
          dataSource: ds.cloneWithRowsAndSections(this._getRows()),
          isRefreshing: false,
          paginationStatus: 'firstLoad',
          data: this._getRows()
        };
      } else {
        ds = new ListView.DataSource({
          rowHasChanged: props.rowHasChanged ? props.rowHasChanged : (row1, row2) => row1 !== row2,
        });
        this.state = {
          dataSource: ds.cloneWithRows(this._getRows()),
          isRefreshing: false,
          paginationStatus: 'firstLoad',
          data: this._getRows()
        };
      }
    }

    static defaultProps = {
      customStyles: {},
      initialListSize: 10,
      firstLoader: true,
      pagination: true,
      refreshable: true,
      refreshableColors: undefined,
      refreshableProgressBackgroundColor: undefined,
      refreshableSize: undefined,
      refreshableTitle: undefined,
      refreshableTintColor: undefined,
      renderRefreshControl: null,
      headerView: null,
      sectionHeaderView: null,
      scrollEnabled: true,
      withSections: false,
      onFetch(page, callback, options) {
        callback([]);
      },

      paginationFetchingView: null,
      paginationAllLoadedView: null,
      paginationWaitingView: null,
      emptyView: null,
      renderSeparator: null,
      rowHasChanged: null,
      distinctRows: null,
      infinite: true
    }

    static propTypes = {
      customStyles: PropTypes.object,
      initialListSize: PropTypes.number,
      firstLoader: PropTypes.bool,
      pagination: PropTypes.bool,
      refreshable: PropTypes.bool,
      refreshableColors: PropTypes.array,
      refreshableProgressBackgroundColor: PropTypes.string,
      refreshableSize: PropTypes.string,
      refreshableTitle: PropTypes.string,
      refreshableTintColor: PropTypes.string,
      renderRefreshControl: PropTypes.func,
      headerView: PropTypes.func,
      sectionHeaderView: PropTypes.func,
      scrollEnabled: PropTypes.bool,
      withSections: PropTypes.bool,
      onFetch: PropTypes.func,

      paginationFetchingView: PropTypes.func,
      paginationAllLoadedView: PropTypes.func,
      paginationWaitingView: PropTypes.func,
      emptyView: PropTypes.func,
      renderSeparator: PropTypes.func,

      rowHasChanged: PropTypes.func,
      distinctRows: PropTypes.func,
    }

    _setPage = (page) => {
      this._page = page;
    }
    _getPage = () => {
      return this._page;
    }
    _setRows = (rows) => {
      this._rows = rows;
    }
    _getRows = () => {
      return this._rows;
    }
    _setComponentType = (type) => {
      this._componentType = type
    }
    _getComponentType = () => {
      return this._componentType
    }

    paginationFetchingView = () => {
      if (this.props.paginationFetchingView) {
        return this.props.paginationFetchingView();
      }

      return (
        <View style={[styles.paginationView, this.props.customStyles.paginationView]}>
          <ActivityIndicator/>
        </View>
      );
    }
    paginationAllLoadedView = () => {

      if (this.props.paginationAllLoadedView) {
        return this.props.paginationAllLoadedView();
      }

      return (
        <View style={[styles.paginationView, this.props.customStyles.paginationView]}>

          <Text style={[styles.actionsLabel, this.props.customStyles.actionsLabel]}>
            没有更多内容
          </Text>
        </View>
      );
    }
    paginationWaitingView = (paginateCallback) => {
      if (this.props.paginationWaitingView) {
        return this.props.paginationWaitingView(paginateCallback);
      }

      return (
        <TouchableHighlight
          underlayColor='#c8c7cc'
          onPress={paginateCallback}
          style={[styles.paginationView, this.props.customStyles.paginationView]}
        >
          <Text style={[styles.actionsLabel, this.props.customStyles.actionsLabel]}>
            加载更多...
          </Text>
        </TouchableHighlight>
      );
    }
    headerView = () => {
      if (this.state.paginationStatus === 'firstLoad' || !this.props.headerView) {
        // return<View style={{height:100,width:200,backgroundColor:'red'}}></View>
        return null;
      }
      return this.props.headerView();
    }


    emptyView = (refreshCallback) => {
      if (this.props.emptyView) {
        return this.props.emptyView(refreshCallback);
      }

      if (this.props.network == 'none' || this.props.network == 'NONE') {
        return (
          <TouchableWithoutFeedback onPress={() => {
            this._refresh()
          }}>
            <View style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              height: screenHeight,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f5f5f5'
            }}>
              <Image source={require('../noNetwork.png')}
                     style={{width: screenWidth, height: screenWidth}}></Image>
            </View>
          </TouchableWithoutFeedback>
        )
      }

      return (
        <View style={[styles.defaultView, this.props.customStyles.defaultView]}>
          <Text style={[styles.defaultViewTitle, this.props.customStyles.defaultViewTitle]}>

          </Text>

          <TouchableHighlight
            underlayColor='#c8c7cc'
            onPress={refreshCallback}
          >
            <Text>

            </Text>
          </TouchableHighlight>
        </View>
      );
    }
    renderSeparator = () => {
      if (this.props.renderSeparator) {
        return this.props.renderSeparator();
      }

      return (
        <View style={[styles.separator, this.props.customStyles.separator]}/>
      );
    }

    getInitialState() {
      this._setPage(1);
      this._setRows([]);

      var ds = null;
      if (this.props.withSections === true) {
        ds = new ListView.DataSource({
          rowHasChanged: this.props.rowHasChanged ? this.props.rowHasChanged : (row1, row2) => row1 !== row2,
          sectionHeaderHasChanged: (section1, section2) => section1 !== section2,
        });
        return {
          dataSource: ds.cloneWithRowsAndSections(this._getRows()),
          isRefreshing: false,
          paginationStatus: 'firstLoad',
          data: this._getRows()
        };
      } else {
        ds = new ListView.DataSource({
          rowHasChanged: this.props.rowHasChanged ? this.props.rowHasChanged : (row1, row2) => row1 !== row2,
        });
        return {
          dataSource: ds.cloneWithRows(this._getRows()),
          isRefreshing: false,
          paginationStatus: 'firstLoad',
          data: this._getRows()
        };
      }
    }

    componentDidMount() {
      this._isMounted=true;
      this.props.onFetch(this._getPage(), this._postRefresh, {firstLoad: true});
    }
    componentWillUnmount(){
      this._isMounted=false
    }
    setNativeProps(props) {
      this.refs.listview.setNativeProps(props);
    }

    _refresh = () => {
      this._onRefresh({external: true});
    }

    _onRefresh = (options = {}) => {
      if (this._isMounted) {
        this.setState({
          isRefreshing: true,
        });
        this._setPage(1);
        this.props.onFetch(this._getPage(), this._postRefresh, options);
      }
    }

    _postRefresh = (rows = [], options = {}) => {
      if (this._isMounted) {
        this._updateRows(rows, options);
      }
    }

    _onPaginate = () => {
      if (this.state.paginationStatus === 'allLoaded') {
        return null
      } else {
        this.setState({
          paginationStatus: 'fetching',
        });
        this.props.onFetch(this._getPage() + 1, this._postPaginate, {});
      }
    }

    _postPaginate = (rows = [], options = {}) => {
      this._setPage(this._getPage() + 1);
      var mergedRows = null;
      if (this.props.withSections === true) {
        mergedRows = MergeRecursive(this._getRows(), rows);
      } else {
        mergedRows = this._getRows().concat(rows);
      }

      if (this.props.distinctRows) {
        mergedRows = this.props.distinctRows(mergedRows);
      }

      this._updateRows(mergedRows, options);
    }

    _updateRows = (rows = [], options = {}) => {
      if (rows !== null) {
        this._setRows(rows);
        if (this.props.withSections === true) {
          this.setState({
            dataSource: this.state.dataSource.cloneWithRowsAndSections(rows),
            isRefreshing: false,
            data: rows,
            paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
          });
        } else {
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(rows),
            isRefreshing: false,
            data: rows,
            paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
          });
        }
      } else {
        this.setState({
          isRefreshing: false,
          paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
        });
      }
    }

    _renderPaginationView = () => {
      if ((this.state.paginationStatus === 'fetching' && this.props.pagination === true) || (this.state.paginationStatus === 'firstLoad' && this.props.firstLoader === true)) {
        return this.paginationFetchingView();
      } else if (this.state.paginationStatus === 'waiting' && this.props.pagination === true && (this.props.withSections === true || this._getRows().length > 0)) {
        return this.paginationWaitingView(this._onPaginate);
      } else if (this.state.paginationStatus === 'allLoaded' && this.props.pagination === true) {
        if (this.props.renderFooter) {
          return this.props.renderFooter()
        }
        if (this._getRows().length === 0 && (this.props.network == 'none' || this.props.network == 'NONE')) {
          return this.emptyView(this._onRefresh);
        } else {
          return this.paginationAllLoadedView();
        }
      } else if (this._getRows().length === 0) {
        return this.emptyView(this._onRefresh);
      } else {
        return null;
      }
    }

    renderRefreshControl = () => {
      if (this.props.renderRefreshControl) {
        return this.props.renderRefreshControl({onRefresh: this._onRefresh});
      }
      return (
        <RefreshControl
          onRefresh={this._onRefresh}
          refreshing={this.state.isRefreshing}
          colors={this.props.refreshableColors}
          progressBackgroundColor={this.props.refreshableProgressBackgroundColor}
          size={this.props.refreshableSize}
          tintColor={this.props.refreshableTintColor}
          title={this.props.refreshableTitle}
        />
      );
    }
    getNode = () => {
      return this.refs.listview;
    }
    renderItem = ({item, index, separators}) => {
      if (this.props.rowView) {
        return this.props.rowView(item, index);
      }
    }

    render() {
      let listProps = {};

      if (this._getComponentType() === 'ListView') {
        listProps = {
          ref: 'listview',
          removeClippedSubviews: true,
          dataSource: this.state.dataSource,
          renderRow: this.props.rowView,
          renderSectionHeader: this.props.sectionHeaderView,
          renderHeader: this.headerView,
          renderFooter: this._renderPaginationView,
          renderSeparator: this.renderSeparator,
          overScrollMode: 'auto',
          stickySectionHeadersEnabled: this.props.stickySectionHeadersEnabled,
          automaticallyAdjustContentInsets: false,
          scrollEnabled: this.props.scrollEnabled,
          canCancelContentTouches: true,
          refreshControl: this.props.refreshable === true ? this.renderRefreshControl() : null,
          ...this.props,
          onEndReached: this.props.infinite ? this._onPaginate : null,
          onEndReachedThreshold: 40,
          style: this.props.style,
        }
      } else if (this._getComponentType() === 'FlatList') {
        listProps = {
          ref: 'listview',
          data: this.state.data,
          renderItem: this.renderItem,
          ItemSeparatorComponent: this.renderSeparator,
          ListHeaderComponent: this.headerView,
          ListFooterComponent: this._renderPaginationView,
          ...this.props,
          onEndReached: this.props.infinite ? this._onPaginate : null,
          onEndReachedThreshold: 40,
          style: this.props.style,
          refreshControl: this.props.refreshable === true ? this.renderRefreshControl() : null,
        }
      }
      return (
        <WrappedComponent
          {...listProps}
        />
      )
    }
  }
}
const styles=StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#CCC'
  },
  actionsLabel: {
    fontSize: 12,
    color: '#EEE'
  },
  paginationView: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',

  },
  defaultView: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  defaultViewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
})
module.exports = createGiftedList;
