import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'

type Game = {
  id: string
  name: string
  slug: string
  description: string
  icon_url: string
  active: boolean
}

type Currency = {
  id: string
  game_id: string
  name: string
  symbol: string
}

type Category = {
  id: string
  game_id: string
  name: string
}

type Item = {
  id: string
  game_id: string
  category_id: string | null
  name: string
  description: string
  image_url: string
  value: number
  demand: number
  rarity: string
  active: boolean
}

type Admin = {
  user_id: string
  role: 'admin' | 'super_admin'
}

export default function App() {
  const [games, setGames] = useState<Game[]>([])
  const [gameId, setGameId] = useState('')
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])

  const [session, setSession] = useState<any>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)

  const [tab, setTab] = useState<
    'values' | 'calculator' | 'proofs' | 'admin'
  >('values')

  const [adminPage, setAdminPage] = useState<
    'dashboard' | 'games' | 'items'
  >('dashboard')

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  const [showGameEditor, setShowGameEditor] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)

  const [showItemEditor, setShowItemEditor] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const game = games.find(g => g.id === gameId)

  const notify = (text: string) => {
    setMessage(text)

    setTimeout(() => {
      setMessage('')
    }, 2500)
  }

  /*
   * AUTH
   */

  useEffect(() => {
    loadSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)

      if (!newSession) {
        setAdmin(null)
      } else {
        checkAdmin(newSession.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadSession() {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    setSession(session)

    if (session) {
      await checkAdmin(session.user.id)
    }

    setLoading(false)
  }

  async function checkAdmin(userId: string) {
    const { data, error } = await supabase
      .from('admins')
      .select('user_id, role')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error(error)
      return
    }

    setAdmin(data)
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      notify(error.message)
      return
    }

    notify('Signed in successfully')
  }

  async function logout() {
    await supabase.auth.signOut()

    setAdmin(null)
    setSession(null)
    setTab('values')

    notify('Signed out')
  }

  /*
   * DATA
   */

  async function loadGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error(error)
      notify('Could not load games')
      return
    }

    setGames(data || [])

    if (!gameId && data?.length) {
      setGameId(data[0].id)
    }
  }

  async function loadGameData(id: string) {
    const [
      currencyResult,
      categoryResult,
      itemResult
    ] = await Promise.all([
      supabase
        .from('currencies')
        .select('*')
        .eq('game_id', id)
        .order('name'),

      supabase
        .from('item_categories')
        .select('*')
        .eq('game_id', id)
        .order('name'),

      supabase
        .from('items')
        .select('*')
        .eq('game_id', id)
        .eq('active', true)
        .order('name')
    ])

    if (currencyResult.error) {
      console.error(currencyResult.error)
    }

    if (categoryResult.error) {
      console.error(categoryResult.error)
    }

    if (itemResult.error) {
      console.error(itemResult.error)
    }

    setCurrencies(currencyResult.data || [])
    setCategories(categoryResult.data || [])
    setItems(itemResult.data || [])
  }

  useEffect(() => {
    loadGames()
  }, [])

  useEffect(() => {
    if (gameId) {
      loadGameData(gameId)
    } else {
      setCurrencies([])
      setCategories([])
      setItems([])
    }
  }, [gameId])

  /*
   * GAMES
   */

  async function saveGame(gameData: Partial<Game>) {
    if (!admin) {
      notify('You must be an admin')
      return
    }

    if (!gameData.name?.trim()) {
      notify('Game name is required')
      return
    }

    const slug =
      gameData.slug?.trim() ||
      gameData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    const payload = {
      name: gameData.name.trim(),
      slug,
      description: gameData.description || '',
      icon_url: gameData.icon_url || '',
      active: true
    }

    let result

    if (gameData.id) {
      result = await supabase
        .from('games')
        .update(payload)
        .eq('id', gameData.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('games')
        .insert(payload)
        .select()
        .single()
    }

    if (result.error) {
      notify(result.error.message)
      return
    }

    await loadGames()

    if (result.data) {
      setGameId(result.data.id)
    }

    setShowGameEditor(false)
    setEditingGame(null)

    notify('Game saved')
  }

  async function deleteGame(id: string) {
    if (!admin) return

    if (!confirm('Delete this game and everything inside it?')) {
      return
    }

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id)

    if (error) {
      notify(error.message)
      return
    }

    if (gameId === id) {
      setGameId('')
    }

    await loadGames()

    notify('Game deleted')
  }

  /*
   * ITEMS
   */

  async function saveItem(itemData: Partial<Item>) {
    if (!admin || !game) {
      notify('You must be an admin')
      return
    }

    if (!itemData.name?.trim()) {
      notify('Item name is required')
      return
    }

    const payload = {
      game_id: game.id,
      category_id: itemData.category_id || null,
      name: itemData.name.trim(),
      description: itemData.description || '',
      image_url: itemData.image_url || '',
      value: Number(itemData.value || 0),
      demand: Number(itemData.demand || 0),
      rarity: itemData.rarity || '',
      active: true
    }

    let result

    if (itemData.id) {
      result = await supabase
        .from('items')
        .update(payload)
        .eq('id', itemData.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('items')
        .insert(payload)
        .select()
        .single()
    }

    if (result.error) {
      notify(result.error.message)
      return
    }

    await loadGameData(game.id)

    setShowItemEditor(false)
    setEditingItem(null)

    notify('Item saved')
  }

  async function deleteItem(id: string) {
    if (!admin) return

    if (!confirm('Delete this item?')) {
      return
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (error) {
      notify(error.message)
      return
    }

    await loadGameData(game!.id)

    notify('Item deleted')
  }

  /*
   * FILTERING
   */

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim()

    if (!term) {
      return items
    }

    return items.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.rarity.toLowerCase().includes(term)
    )
  }, [items, search])

  /*
   * LOADING
   */

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">❄️</div>
        <h1>SnowyValues</h1>
        <p>Loading...</p>
      </div>
    )
  }

  /*
   * UI
   */

  return (
    <div className="app">

      <header className="topbar">

        <div className="brand">
          <div className="brand-icon">❄️</div>

          <div>
            <strong>SnowyValues</strong>
            <span>Roblox values</span>
          </div>
        </div>

        {games.length > 0 && (
          <select
            className="game-select"
            value={gameId}
            onChange={e => setGameId(e.target.value)}
          >
            {games.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        )}

        <nav className="nav">

          <button
            className={tab === 'values' ? 'active' : ''}
            onClick={() => setTab('values')}
          >
            Values
          </button>

          <button
            className={tab === 'calculator' ? 'active' : ''}
            onClick={() => setTab('calculator')}
          >
            Calculator
          </button>

          <button
            className={tab === 'proofs' ? 'active' : ''}
            onClick={() => setTab('proofs')}
          >
            Trade Proofs
          </button>

          {admin && (
            <button
              className={tab === 'admin' ? 'active' : ''}
              onClick={() => setTab('admin')}
            >
              Admin
            </button>
          )}

        </nav>

        {session ? (
          <button className="logout-button" onClick={logout}>
            Log out
          </button>
        ) : (
          <button
            className="login-button"
            onClick={() => setTab('admin')}
          >
            Admin Login
          </button>
        )}

      </header>

      {message && (
        <div className="toast">
          {message}
        </div>
      )}

      <main>

        {/* EMPTY DATABASE */}

        {games.length === 0 && tab !== 'admin' && (
          <section className="empty-state hero-empty">

            <div className="empty-icon">
              ❄️
            </div>

            <h1>Welcome to SnowyValues</h1>

            <p>
              There are no games available yet.
            </p>

            <p className="muted">
              An administrator needs to add the first game.
            </p>

            <button
              className="primary"
              onClick={() => setTab('admin')}
            >
              Open Admin Login
            </button>

          </section>
        )}

        {/* VALUES */}

        {game && tab === 'values' && (
          <>
            <section className="page-heading">

              <div>

                <p className="eyebrow">
                  {items.length} ITEMS
                </p>

                <h1>
                  {game.name}
                </h1>

                {game.description && (
                  <p>{game.description}</p>
                )}

              </div>

            </section>

            <div className="search-bar">

              <span>⌕</span>

              <input
                placeholder={`Search ${game.name} items...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

            </div>

            {filteredItems.length === 0 ? (

              <section className="empty-state">

                <div className="empty-icon">
                  🔎
                </div>

                <h2>
                  {items.length === 0
                    ? 'No items yet'
                    : 'No items found'}
                </h2>

                <p>
                  {items.length === 0
                    ? 'An administrator can add items from the Admin panel.'
                    : 'Try a different search.'}
                </p>

              </section>

            ) : (

              <section className="item-grid">

                {filteredItems.map(item => {

                  const category =
                    categories.find(
                      c => c.id === item.category_id
                    )

                  return (
                    <article
                      className="item-card"
                      key={item.id}
                    >

                      <div className="item-image">

                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                          />
                        ) : (
                          <span>✨</span>
                        )}

                      </div>

                      <div className="item-info">

                        <div className="item-top">

                          <h3>
                            {item.name}
                          </h3>

                          {item.rarity && (
                            <span className="badge">
                              {item.rarity}
                            </span>
                          )}

                        </div>

                        {category && (
                          <span className="category">
                            {category.name}
                          </span>
                        )}

                        <strong className="item-value">
                          {formatNumber(item.value)}
                          {' '}
                          {currencies[0]?.symbol}
                        </strong>

                        {item.demand > 0 && (
                          <span className="demand">
                            Demand {item.demand}/10
                          </span>
                        )}

                      </div>

                    </article>
                  )
                })}

              </section>
            )}
          </>
        )}

        {/* CALCULATOR */}

        {game && tab === 'calculator' && (
          <Calculator
            items={items}
            currency={currencies[0]}
          />
        )}

        {/* PROOFS */}

        {tab === 'proofs' && (
          <TradeProofs
            gameId={game?.id}
            notify={notify}
          />
        )}

        {/* ADMIN */}

        {tab === 'admin' && !admin && (
          <Login onLogin={login} />
        )}

        {tab === 'admin' && admin && (
          <AdminPanel
            games={games}
            game={game}
            items={items}
            admin={admin}
            page={adminPage}
            setPage={setAdminPage}
            openGame={gameData => {
              setEditingGame(gameData)
              setShowGameEditor(true)
            }}
            newGame={() => {
              setEditingGame(null)
              setShowGameEditor(true)
            }}
            deleteGame={deleteGame}
            openItem={item => {
              setEditingItem(item)
              setShowItemEditor(true)
            }}
            newItem={() => {
              setEditingItem(null)
              setShowItemEditor(true)
            }}
            deleteItem={deleteItem}
          />
        )}

      </main>

      {showGameEditor && (
        <GameEditor
          game={editingGame}
          close={() => {
            setShowGameEditor(false)
            setEditingGame(null)
          }}
          save={saveGame}
        />
      )}

      {showItemEditor && game && (
        <ItemEditor
          item={editingItem}
          categories={categories}
          close={() => {
            setShowItemEditor(false)
            setEditingItem(null)
          }}
          save={saveItem}
        />
      )}

    </div>
  )
}

/*
 * LOGIN
 */

function Login({
  onLogin
}: {
  onLogin: (email: string, password: string) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <section className="auth-card">

      <div className="auth-icon">
        🔐
      </div>

      <p className="eyebrow">
        ADMIN AREA
      </p>

      <h1>Welcome back</h1>

      <p className="muted">
        Sign in to manage SnowyValues.
      </p>

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button
        className="primary"
        onClick={() => onLogin(email, password)}
      >
        Sign in
      </button>

    </section>
  )
}

/*
 * ADMIN
 */

function AdminPanel({
  games,
  game,
  items,
  admin,
  page,
  setPage,
  openGame,
  newGame,
  deleteGame,
  openItem,
  newItem,
  deleteItem
}: any) {

  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">

        <p className="eyebrow">
          ADMIN
        </p>

        <h1>Dashboard</h1>

        <button
          className={page === 'dashboard' ? 'active' : ''}
          onClick={() => setPage('dashboard')}
        >
          Overview
        </button>

        <button
          className={page === 'games' ? 'active' : ''}
          onClick={() => setPage('games')}
        >
          Games
        </button>

        <button
          className={page === 'items' ? 'active' : ''}
          onClick={() => setPage('items')}
        >
          Items
        </button>

      </aside>

      <section className="admin-content">

        {page === 'dashboard' && (
          <>
            <h2>Overview</h2>

            <div className="stats">

              <div className="stat">
                <span>Games</span>
                <strong>{games.length}</strong>
              </div>

              <div className="stat">
                <span>Current game items</span>
                <strong>{items.length}</strong>
              </div>

              <div className="stat">
                <span>Role</span>
                <strong>{admin.role}</strong>
              </div>

            </div>

            {games.length === 0 && (
              <section className="admin-empty">

                <h2>No games yet</h2>

                <p>
                  Your database is completely empty.
                  Create your first game to get started.
                </p>

                <button
                  className="primary"
                  onClick={newGame}
                >
                  + Add Game
                </button>

              </section>
            )}
          </>
        )}

        {page === 'games' && (
          <>
            <div className="admin-heading">

              <div>
                <p className="eyebrow">
                  DATABASE
                </p>

                <h2>Games</h2>
              </div>

              <button
                className="primary"
                onClick={newGame}
              >
                + Add Game
              </button>

            </div>

            <div className="admin-list">

              {games.map((g: Game) => (
                <div
                  className="admin-row"
                  key={g.id}
                >

                  <div>

                    <strong>
                      {g.name}
                    </strong>

                    <span>
                      /{g.slug}
                    </span>

                  </div>

                  <div className="row-actions">

                    <button
                      onClick={() => openGame(g)}
                    >
                      Edit
                    </button>

                    <button
                      className="danger"
                      onClick={() => deleteGame(g.id)}
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}

              {games.length === 0 && (
                <p className="muted">
                  No games have been created.
                </p>
              )}

            </div>
          </>
        )}

        {page === 'items' && (
          <>
            <div className="admin-heading">

              <div>
                <p className="eyebrow">
                  {game?.name || 'NO GAME SELECTED'}
                </p>

                <h2>Items</h2>
              </div>

              {game && (
                <button
                  className="primary"
                  onClick={newItem}
                >
                  + Add Item
                </button>
              )}

            </div>

            {!game ? (
              <p className="muted">
                Create a game first.
              </p>
            ) : items.length === 0 ? (
              <section className="admin-empty">

                <h2>No items yet</h2>

                <p>
                  Add the first item to {game.name}.
                </p>

                <button
                  className="primary"
                  onClick={newItem}
                >
                  + Add Item
                </button>

              </section>
            ) : (

              <div className="admin-list">

                {items.map((item: Item) => (
                  <div
                    className="admin-row"
                    key={item.id}
                  >

                    <div className="admin-item-name">

                      <div className="mini-image">

                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                          />
                        ) : (
                          '✨'
                        )}

                      </div>

                      <div>

                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {formatNumber(item.value)}
                        </span>

                      </div>

                    </div>

                    <div className="row-actions">

                      <button
                        onClick={() => openItem(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="danger"
                        onClick={() => deleteItem(item.id)}
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </>
        )}

      </section>

    </div>
  )
}

/*
 * GAME EDITOR
 */

function GameEditor({
  game,
  close,
  save
}: {
  game: Game | null
  close: () => void
  save: (data: Partial<Game>) => void
}) {

  const [name, setName] = useState(game?.name || '')
  const [slug, setSlug] = useState(game?.slug || '')
  const [description, setDescription] = useState(
    game?.description || ''
  )
  const [icon, setIcon] = useState(game?.icon_url || '')

  return (
    <Modal>

      <p className="eyebrow">
        {game ? 'EDIT GAME' : 'NEW GAME'}
      </p>

      <h2>
        {game ? 'Edit game' : 'Create a game'}
      </h2>

      <label>
        Game name

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Example: Anime Defenders"
        />

      </label>

      <label>
        Slug

        <input
          value={slug}
          onChange={e => setSlug(e.target.value)}
          placeholder="anime-defenders"
        />

      </label>

      <label>
        Description

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the game..."
        />

      </label>

      <label>
        Icon URL

        <input
          value={icon}
          onChange={e => setIcon(e.target.value)}
          placeholder="https://..."
        />

      </label>

      <div className="modal-actions">

        <button onClick={close}>
          Cancel
        </button>

        <button
          className="primary"
          onClick={() =>
            save({
              id: game?.id,
              name,
              slug,
              description,
              icon_url: icon
            })
          }
        >
          Save Game
        </button>

      </div>

    </Modal>
  )
}

/*
 * ITEM EDITOR
 */

function ItemEditor({
  item,
  categories,
  close,
  save
}: {
  item: Item | null
  categories: Category[]
  close: () => void
  save: (data: Partial<Item>) => void
}) {

  const [name, setName] = useState(item?.name || '')
  const [description, setDescription] = useState(
    item?.description || ''
  )
  const [image, setImage] = useState(item?.image_url || '')
  const [value, setValue] = useState(
    String(item?.value || 0)
  )
  const [demand, setDemand] = useState(
    String(item?.demand || 0)
  )
  const [rarity, setRarity] = useState(
    item?.rarity || ''
  )
  const [category, setCategory] = useState(
    item?.category_id || ''
  )

  return (
    <Modal>

      <p className="eyebrow">
        {item ? 'EDIT ITEM' : 'NEW ITEM'}
      </p>

      <h2>
        {item ? 'Edit item' : 'Create an item'}
      </h2>

      <label>
        Item name

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Example: Shadow Dragon"
        />

      </label>

      <label>
        Category

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
        >

          <option value="">
            No category
          </option>

          {categories.map(c => (
            <option
              key={c.id}
              value={c.id}
            >
              {c.name}
            </option>
          ))}

        </select>

      </label>

      <label>
        Rarity

        <input
          value={rarity}
          onChange={e => setRarity(e.target.value)}
          placeholder="Secret, Mythic, Legendary..."
        />

      </label>

      <label>
        Value

        <input
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
        />

      </label>

      <label>
        Demand

        <input
          type="number"
          min="0"
          max="10"
          value={demand}
          onChange={e => setDemand(e.target.value)}
        />

      </label>

      <label>
        Image URL

        <input
          value={image}
          onChange={e => setImage(e.target.value)}
          placeholder="https://..."
        />

      </label>

      <label>
        Description

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe this item..."
        />

      </label>

      <div className="modal-actions">

        <button onClick={close}>
          Cancel
        </button>

        <button
          className="primary"
          onClick={() =>
            save({
              id: item?.id,
              name,
              description,
              image_url: image,
              value: Number(value),
              demand: Number(demand),
              rarity,
              category_id: category || null
            })
          }
        >
          Save Item
        </button>

      </div>

    </Modal>
  )
}

/*
 * CALCULATOR
 */

function Calculator({
  items,
  currency
}: {
  items: Item[]
  currency?: Currency
}) {

  const [give, setGive] = useState<string[]>([])
  const [get, setGet] = useState<string[]>([])

  const giveValue = give.reduce(
    (total, id) =>
      total +
      Number(items.find(i => i.id === id)?.value || 0),
    0
  )

  const getValue = get.reduce(
    (total, id) =>
      total +
      Number(items.find(i => i.id === id)?.value || 0),
    0
  )

  const difference = getValue - giveValue

  return (
    <section className="calculator-page">

      <p className="eyebrow">
        TRADE TOOL
      </p>

      <h1>
        Trade Calculator
      </h1>

      <p className="muted">
        Compare the total value of both sides of a trade.
      </p>

      {items.length === 0 ? (

        <section className="empty-state">
          <h2>No items available</h2>
          <p>
            An administrator needs to add items before
            the calculator can be used.
          </p>
        </section>

      ) : (

        <>

          <div className="trade-columns">

            <TradeSide
              title="You Give"
              items={items}
              selected={give}
              setSelected={setGive}
            />

            <div className="trade-result">

              <span>Difference</span>

              <strong>
                {difference > 0 ? '+' : ''}
                {formatNumber(difference)}
                {' '}
                {currency?.symbol}
              </strong>

              <div
                className={
                  difference > 0
                    ? 'win'
                    : difference < 0
                    ? 'loss'
                    : 'even'
                }
              >
                {difference > 0
                  ? 'You win'
                  : difference < 0
                  ? 'You lose'
                  : 'Fair trade'}
              </div>

            </div>

            <TradeSide
              title="You Get"
              items={items}
              selected={get}
              setSelected={setGet}
            />

          </div>

        </>

      )}

    </section>
  )
}

function TradeSide({
  title,
  items,
  selected,
  setSelected
}: {
  title: string
  items: Item[]
  selected: string[]
  setSelected: (items: string[]) => void
}) {

  const total = selected.reduce(
    (sum, id) =>
      sum +
      Number(items.find(i => i.id === id)?.value || 0),
    0
  )

  return (
    <div className="trade-side">

      <div className="trade-side-heading">

        <h2>{title}</h2>

        <strong>
          {formatNumber(total)}
        </strong>

      </div>

      <select
        value=""
        onChange={e => {
          if (!e.target.value) return

          setSelected([
            ...selected,
            e.target.value
          ])
        }}
      >

        <option value="">
          + Add item
        </option>

        {items.map(item => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.name} — {formatNumber(item.value)}
          </option>
        ))}

      </select>

      <div className="trade-items">

        {selected.map((id, index) => {

          const item = items.find(i => i.id === id)

          if (!item) return null

          return (
            <div
              className="trade-item"
              key={`${id}-${index}`}
            >

              <span>
                {item.name}
              </span>

              <button
                onClick={() =>
                  setSelected(
                    selected.filter(
                      (_, i) => i !== index
                    )
                  )
                }
              >
                ×
              </button>

            </div>
          )
        })}

        {selected.length === 0 && (
          <p className="muted">
            Nothing added yet.
          </p>
        )}

      </div>

    </div>
  )
}

/*
 * TRADE PROOFS
 */

function TradeProofs({
  gameId,
  notify
}: {
  gameId?: string
  notify: (message: string) => void
}) {

  const [description, setDescription] = useState('')
  const [username, setUsername] = useState('')
  const [image, setImage] = useState('')

  async function submit() {

    if (!gameId) {
      notify('Select a game first')
      return
    }

    if (!description.trim()) {
      notify('Describe the trade first')
      return
    }

    const {
      data: { user }
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('trade_proofs')
      .insert({
        game_id: gameId,
        username,
        description,
        image_url: image,
        submitted_by: user?.id || null,
        status: 'pending'
      })

    if (error) {
      notify(error.message)
      return
    }

    setDescription('')
    setUsername('')
    setImage('')

    notify('Trade proof submitted for review')
  }

  return (
    <section className="proof-page">

      <p className="eyebrow">
        COMMUNITY
      </p>

      <h1>
        Trade Proofs
      </h1>

      <p className="muted">
        Submit a trade for the SnowyValues team to review.
      </p>

      <div className="proof-form">

        <input
          placeholder="Roblox username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          placeholder="Proof image URL"
          value={image}
          onChange={e => setImage(e.target.value)}
        />

        <textarea
          placeholder="Describe the trade..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <button
          className="primary"
          onClick={submit}
        >
          Submit Proof
        </button>

      </div>

    </section>
  )
}

/*
 * MODAL
 */

function Modal({
  children
}: {
  children: React.ReactNode
}) {

  return (
    <div className="modal-overlay">

      <div className="modal">
        {children}
      </div>

    </div>
  )
}

/*
 * HELPERS
 */

function formatNumber(value: number) {

  return new Intl.NumberFormat(
    'en-US',
    {
      maximumFractionDigits: 2
    }
  ).format(value)
}
