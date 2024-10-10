import Pocketbase from 'pocketbase'

export const pb = new Pocketbase('http://localhost:8090')

export function validateLogin() {
    return pb.authStore.isValid
}