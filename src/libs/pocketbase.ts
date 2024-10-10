import Pocketbase from 'pocketbase'

export const pb = new Pocketbase('http://localhost:8090')

export function validateLogin() {
    return pb.authStore.isValid
}

// TODO: Move every backend related stuff here
// TODO: Find a free way to host pocketbase, or ditch pocketbase and move to firebase