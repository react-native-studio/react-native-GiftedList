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

      var ds = null,dataSource=null;
      if (props.withSections === true) {
        ds = new ListView.DataSource({
          rowHasChanged: props.rowHasChanged ? props.rowHasChanged : (row1, row2) => row1 !== row2,
          sectionHeaderHasChanged: (section1, section2) => section1 !== section2,
        });
        dataSource=ds.cloneWithRowsAndSections(this._getRows())
      } else {
        ds = new ListView.DataSource({
          rowHasChanged: props.rowHasChanged ? props.rowHasChanged : (row1, row2) => row1 !== row2,
        });
        dataSource=ds.cloneWithRows(this._getRows())
      }
      this.state={
        dataSource,//供ListView使用
        isRefreshing:false,
        paginationStatus:'firstLoad',
        data:this._getRows(),//供FlatList使用
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
      const {paginationFetchingView,customStyles}=this.props;
      if (paginationFetchingView) {
        return paginationFetchingView();
      }
      return (
        <View style={[styles.paginationView,customStyles.paginationView]}>
          <ActivityIndicator/>
          <Text style={[styles.loadingLabel, customStyles.loadingLabel]}>数据加载中</Text>
        </View>
      );
    }
    paginationAllLoadedView = () => {
      const {paginationAllLoadedView,customStyles}=this.props;
      if (paginationAllLoadedView) {
        return paginationAllLoadedView();
      }

      return (
        <View style={[styles.paginationView, customStyles.paginationView]}>
          <Text style={[styles.actionsLabel, customStyles.actionsLabel]}>
            没有更多内容
          </Text>
        </View>
      );
    }
    paginationWaitingView = (paginateCallback) => {
      const {paginationWaitingView,customStyles}=this.props;
      if (paginationWaitingView) {
        return paginationWaitingView(paginateCallback);
      }
      return (
        <TouchableHighlight
          underlayColor='#c8c7cc'
          onPress={paginateCallback}
          style={[styles.paginationView,customStyles.paginationView]}
        >
          <Text style={[styles.actionsLabel,customStyles.actionsLabel]}>
            加载更多...
          </Text>
        </TouchableHighlight>
      );
    }
    headerView = () => {
      if (this.state.paginationStatus === 'firstLoad' || !this.props.headerView) {
        return null;
      }
      return this.props.headerView();
    }


    emptyView = (refreshCallback) => {
      const {emptyView,customStyles}=this.props;
      if (emptyView) {
        return emptyView(refreshCallback);
      }
      return (
        <View style={[styles.defaultView,customStyles.defaultView]}>
          <Text style={[styles.defaultViewTitle, customStyles.defaultViewTitle]}>
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
      const {renderSeparator,customStyles}=this.props;
      if (renderSeparator) {
        return renderSeparator();
      }

      return (
        <View style={[styles.separator,customStyles.separator]}/>
      );
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
            paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'fetching'),
          });
        } else {
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(rows),
            isRefreshing: false,
            data: rows,
            paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'fetching'),
          });
        }
      } else {
        this.setState({
          isRefreshing: false,
          paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'fetching'),
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
          initialListSize:this.props.initialListSize,
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
          initialNumToRender:this.props.initialListSize,
          refreshControl: this.props.refreshable === true ? this.renderRefreshControl() : null,
          ...this.props,
          onEndReached: this.props.infinite ? this._onPaginate : null,
          onEndReachedThreshold: 40,
          style: this.props.style,
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
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#CCC'
  },
  loadingLabel:{
    fontSize:12,
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
