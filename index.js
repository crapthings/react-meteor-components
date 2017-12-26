import React, { Component } from 'react'
import { withTracker } from 'meteor/react-meteor-data'

const config = {
  loading: <div>loading</div>,
}

const { loading } = config

class WithSubscribe extends Component {
  state = {
    ready: false,
  }

  componentWillMount() {
    this.subscribe()
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const { ready } = this.state
    const { children, loading } = this.props
    return ready ? children : (loading || config.loading)
  }

  getSubscriptionArgs = () => {
    const { name, args } = this.props
    if (!args)
      return [name]

    if (!Array.isArray(args))
      return [name, args]

    return [name].concat(args)
  }

  subscribe = () => {
    const subscriptionArgs = this.getSubscriptionArgs()
    this.trackerHandler = Meteor.autorun(computation => {
      this.subscribeHandler = Meteor.subscribe.apply(Meteor.subscribe, subscriptionArgs)
      const ready = this.subscribeHandler.ready()
      this.setState({ ready })
    })
  }

  unsubscribe = () => {
    if (this.trackerHandler)
      this.trackerHandler.stop()
  }
}

class WithTracker extends Component {
  _data = {}

  componentWillMount() {
    this.resolve()
  }

  componentWillUnmount() {
    if (this.trackerHandler)
      this.trackerHandler.stop()
  }

  render() {
    const { props, state } = this
    const { children } = props
    const { data } = state
    return children({ data })
  }

  resolve = () => {
    const { list, item, data } = this.props

    if (list)
      return this.resolveList()

    if (item)
      return this.resolveItem()

    this.resolveData()
  }

  resolveData = () => {
    const { list, item, data } = this.props
    this.trackerHandler = Meteor.autorun(computation => {
      for (const key in data) {
        const value = this.resolveValue(data[key])
        this.setData(key, value)
      }
      this.setState({ data: this.getData() })
    })
  }

  resolveList = () => {
    const { list } = this.props
    this.trackerHandler = Meteor.autorun(computation => {
      const value = this.resolveValue(list)
      this.setState({ data: { list: value } })
    })
  }

  resolveItem = () => {
    const { item } = this.props
    const value = this.resolveValue(item)
      this.trackerHandler = Meteor.autorun(computation => {
      this.setState({ data: { item: value } })
    })
  }

  resolveValue = value => {
    if (isFunction(value))
      value = value()

    if (value instanceof Mongo.Cursor)
      value = value.fetch()

    return value
  }

  getData = key => {
    if (key)
      return this._data[key]

    return this._data
  }

  setData = (key, value) => {
    this._data[key] = value
  }
}

class WithCall extends Component {
  render() {
    return (
      <div>with call</div>
    )
  }
}

function isFunction(fn) {
  return fn && {}.toString.call(fn) === '[object Function]' ? true : false
}

module.exports = {
  WithSubscribe,
  WithTracker,
  WithCall,
  config,
}
