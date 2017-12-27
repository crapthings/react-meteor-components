import React, { Component } from 'react'
import { withTracker } from 'meteor/react-meteor-data'

const config = {
  loading: <div>loading</div>,
}

const { loading } = config

// Meteor.subscribe wrapper
class WithSubscribe extends Component {
  state = {
    error: undefined,
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

  getSubscriptionArgs = () => getArgs(this.props)

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

// Meteor.autorun wrapper
class WithTracker extends Component {
  state = {
    error: undefined,
    data: undefined,
    list: [],
    item: undefined,
  }

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

// Meteor.call wrapper
class WithCall extends Component {
  state = {
    error: undefined,
    data: undefined,
    ready: false,
  }

  componentWillMount() {
    this.resolveCall()
  }

  render() {
    const { ready, error, data } = this.state
    const { children, loading } = this.props

    if (!ready)
      return loading || config.loading

    return (
      children({ data })
    )
  }

  getCallArgs = () => getArgs(this.props)

  resolveCall = () => {
    const callArgs = this.getCallArgs()
    const [callback] = callArgs.slice(-1)

    if (!isFunction(callback))
      callArgs.push(this.callback)

    Meteor.call.apply(Meteor.call, callArgs)
  }

  callback = (error, data) => {
    const ready = true
    error
      ? this.setState({ ready, error })
      : this.setState({ ready, data })
  }
}

// utils

function getArgs(props) {
  const { name, args } = props

  if (!args)
    return [name]

  if (!Array.isArray(args))
    return [name, args]

  return [name].concat(args)
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
