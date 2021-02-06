// Layouts
import ModuleLayout from './layouts/Module.svelte'
import AuthLayout from './layouts/Auth.svelte'

// Components
import ButtonComponent from './atoms/Button.svelte'
import InputComponent from './atoms/Input.svelte'
import SearchComponent from './atoms/Search.svelte'
import WebnavComponent from './molecules/Webnav.svelte'
import AsideComponent from './molecules/Aside.svelte'
import ModalComponent from './molecules/Modal.svelte'
import TableComponent from './molecules/Table.svelte'


export default {
    Module : ModuleLayout,
    Auth : AuthLayout,
    Button : ButtonComponent,
    Input : InputComponent,
    Search : SearchComponent,
    Webnav : WebnavComponent,
    Aside : AsideComponent,
    Modal : ModalComponent,
    Table : TableComponent
}

// Layouts
export const Module = ModuleLayout
export const Auth = AuthLayout

// Components
export const Button = ButtonComponent
export const Input = InputComponent
export const Search = SearchComponent
export const Webnav = WebnavComponent
export const Aside = AsideComponent
export const Modal = ModalComponent
export const Table = TableComponent