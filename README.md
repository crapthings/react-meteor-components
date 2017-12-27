### USAGE

```javascript
import React, { Component } from 'react'
import { render } from 'react-dom'
import lfc from 'lodash-form-collector'

import {
  WithSubscribe,
  WithTracker,
  WithCall,
  WithUserId,
  WithoutUserId,
} from 'meteor/crapthings:react-meteor-components'

const Demo1 = () => {
  return (
    <div>
      <h3>subscribe to an reactive list</h3>
      <WithSubscribe name='users'>
        <WithTracker list={context => Users.find()}>
          {({ data: { list: users } }) => (
            users.map(({ _id, name }) => (
              <div key={_id}>{name}</div>
            ))
          )}
        </WithTracker>
      </WithSubscribe>
    </div>
  )
}

const Demo2 = () => {
  return (
    <div>
      <h3>subscribe to an reactive item</h3>
      <WithSubscribe name='user'>
        <WithTracker item={context => Users.findOne({ name: { $exists: true } })}>
          {({ data: { item: { _id, name} } }) => (
            <div>{name}</div>
          )}
        </WithTracker>
      </WithSubscribe>
    </div>
  )
}

const Demo3 = () => {
  return (
    <div>
      <h3>tracker with data props</h3>
      <WithSubscribe name='users'>
        <WithTracker data={{
          title: 'this is a title',
          users: context => Users.find(),
        }}>
          {({ data: { title, users } }) => (
            <div>
              <h4>{title}</h4>
              {users.map(({ _id, name }) => (
                <div key={_id}>{name}</div>
              ))}
            </div>
          )}
        </WithTracker>
      </WithSubscribe>
    </div>
  )
}

const Demo4 = () => {
  return (
    <div>
      <h3>meteor call</h3>
      <WithCall name='users'>
        {({ data: users }) => {
          return users.map(({ _id, name }) => (
            <div key={_id}>{name}</div>
          ))
        }}
      </WithCall>
    </div>
  )
}

const Demo5 = () => {
  return (
    <div>
      <h3>with user id</h3>
      <WithUserId>
        <button onClick={() => Meteor.logout()}>logout</button>
      </WithUserId>
    </div>
  )
}


const Demo6 = () => {
  return (
    <div>
      <h3>without user id</h3>
      <WithoutUserId>
        <form onSubmit={evt => {
          evt.preventDefault()
          const { username, password } = lfc(evt.target)
          Meteor.loginWithPassword(username, password)
        }}>
          <div>
            <input type='input' name='username' defaultValue='demo' />
          </div>
          <div>
            <input type='password' name='password' defaultValue='demo' />
          </div>
          <div>
            <input type='submit' />
          </div>
        </form>
      </WithoutUserId>
    </div>
  )
}

const Example = () => <div id='example-wrapper'>
  <Demo1 />
  <Demo2 />
  <Demo3 />
  <Demo4 />
  <Demo5 />
  <Demo6 />
</div>

Meteor.startup(function () {
  const app = document.createElement('div')
  app.id = 'app-wrapper'
  document.body.appendChild(app)
  render(<Example />, app)
})
```
