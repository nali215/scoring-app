import {AppHeader} from '@/components/app-header'
import {ScorerLogin} from '@/components/scorer-login'
export default function ScorekeeperPage(){return <><AppHeader/><main className="login-container"><section className="admin-panel"><span className="eyebrow">COURT ACCESS</span><h1>Scorer sign in</h1><p className="muted">Use the court account assigned by your organizer.</p><ScorerLogin/></section></main></>}
