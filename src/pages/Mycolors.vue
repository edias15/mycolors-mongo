<template>
  <q-page>
    <q-toggle label='Color picker' v-model='vColorPicker'/>
    <q-color
      v-show='vColorPicker'
      v-model='hex'
      name='color'
      class='q-ma-lg'
      :value='hex'
      @change='val => hex = val'
    />
    <q-form @submit='handleAdd'>
      <div class='q-pa-md'>
          <div class='row items-start' style='height: 120px align-items: center'>
            <q-select
              v-model='listname'
              label='List Name'
              name='listname'
              use-input
              new-value-mode='add-unique'
              @new-value='createValue'
              @keydown.enter='isnewListname ? null : getList'
              :options='filterOptions'
              :value = 'listname'
              @filter='filterFn'
              style='width: 250px'
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:append>
                <q-icon
                  v-if='model !== null'
                  class='cursor-pointer'
                  name='clear'
                  @click.stop='model = null'
                />
              </template>
            </q-select>
            <q-icon
              class='cursor-pointer'
              name='search'
              size='27px'
              @click='getList'
            >
              <q-tooltip>
                Search a list of colors from database
              </q-tooltip>
            </q-icon>
          </div>
        <q-input
          v-model='hex'
          ref='hex'
          name='hex'
          label='Hex Code'
          :value='hex'
          @keydown.enter='getNameColor'
        >
          <template #prepend>
            <q-avatar
              class='q-ml-lg'
              :style='`background: ${hex}`'
            />
          </template>
          <template #append>
            <q-icon
              class='cursor pointer'
              name='colorize'
            >
              <q-popup-proxy>
                <q-color v-model='hex'></q-color>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          v-model='desc'
          name='desc'
          ref='desc'
          label='Description'
          clearable
          @keydown.enter='handleAdd'
        >
          <template #prepend>
            <q-avatar
              class='q-ml-lg'
              :style='`background: ${hex}`'
            />
          </template>
          <template #append>
            <q-icon
              type='submit'
              @click='handleAdd'
              class='cursor pointer'
              name='add'
            />
          </template>
        </q-input>
      </div>
    </q-form>
    <template>
      <div class='q-pa-md'>
        <q-table
          :grid='lCards'
          :data='rows'
          :columns='columns'
          row-key='hex'
          @row-dblclick='deleteColor'
        >
          <template v-slot:top-left>
            <q-toggle label='Cards' v-model='lCards'/>
          </template>
          <template v-slot:top-right>
            <div class='row items-start' style='height: 120px'>
              <q-btn
                color='primary'
                icon-right='archive'
                label='Export to csv'
                no-caps
                @click='exportTable'
              />
              <q-separator inset/>
              <q-btn
                color='blue'
                icon-right='save'
                label='Save List'
                no-caps
                @click='saveList'
              />
            </div>
          </template>
          <template v-slot:item='props'>
            <div class='q-pa-xs col-xs-12 col-sm-6 col-md-3'>
              <q-card>
                <q-card-section class='row items-center'>
                  Hex Code
                  <br>
                  <strong>{{ props.row.hex }}</strong>
                </q-card-section>
                <q-separator />
                <q-card-section class='flex flex-center' :style='{ background: props.row.hex }'>
                  <div>{{ props.row.description }}</div>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </div>
    </template>
  </q-page>
</template>

<script>
import {
  exportFile,
  Notify,
  patterns
} from 'quasar'
import db from '../db/schema.js'

function wrapCsvValue (val, formatFn) {
  // eslint-disable-next-line no-void
  let formatted = formatFn !== void 0
    ? formatFn(val)
    : val

  // eslint-disable-next-line no-void
  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}

export default {
  mounted () {
    this.getAllLists()
  },
  data () {
    return {
      isnewListname: false,
      model: null,
      allLists: [],
      filterOptions: [],
      vColorPicker: false,
      lCards: false,
      separator: 'horizontal',
      listname: '',
      hex: '',
      desc: '',
      hexa: '',
      rgb: 'rgb(255, 100, 100)',
      rgba: 'rgba(255, 40, 40, 0.5)',
      isColor: patterns.testPattern.anyColor,
      rows: [],
      columns: [
        {
          name: 'hex',
          required: true,
          label: 'Hex Code',
          align: 'left',
          field: row => row.hex,
          format: val => `${val}`,
          sortable: true
        },
        {
          name: 'description',
          align: 'left',
          label: 'Description',
          field: 'description',
          sortable: true
        }
      ]
    }
  },
  methods: {
    deleteColor (evt, row) {
      if (confirm(`Do you want to delete color ${row.hex}?`)) {
        const item = this.rows.findIndex(v => v.hex === row.hex)
        this.$delete(this.rows, item)
      }
    },
    handleAdd () {
      if (!this.isColor(this.hex)) {
        this.$q.notify({
          message: 'Please enter a valid color.',
          type: 'warning'
        })
        this.$refs.hex.focus()
        return
      }
      if (this.desc === '' || this.desc === null) {
        this.$q.notify({
          message: 'Please enter a good description.',
          type: 'warning'
        })
      } else {
        const newColor = {
          listname: this.listname,
          hex: this.hex,
          description: this.desc
        }
        this.rows.push(newColor)
        this.hex = ''
        this.desc = ''
        this.$refs.hex.focus()
      }
    },
    getNameColor () {
      this.$q.notify({
        type: 'positive',
        message: "Searching color's name suggestion..."
      })
      const colorHex = this.hex.replace('#', '')
      if (colorHex.length === 6) {
        fetch(`https://api.color.pizza/v1/${colorHex}`)
          .then(r => {
            return r.json()
          })
          .then(jsonBody => {
            this.desc = jsonBody.colors[0].name
          })
          .catch((error) => {
            alert('Ops : ' + error)
          })
      }
      this.$refs.desc.focus()
    },
    exportTable () {
      // naive encoding to csv format
      const content = [this.columns.map(col => wrapCsvValue(col.label))].concat(
        this.rows.map(row => this.columns.map(col => wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            // eslint-disable-next-line no-void
            : row[col.field === void 0 ? col.name : col.field],
          col.format
        )).join(','))
      ).join('\r\n')
      const status = exportFile(
        'table-export.csv',
        content,
        'text/csv'
      )
      if (status !== true) {
        Notify.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    async getAllLists () {
      await db.listnames.orderBy('listname').uniqueKeys((allLists) => {
        this.allLists = allLists
      })
    },
    async saveList () {
      if (this.listname === '') {
        this.$q.notify({
          message: "Please enter a list's name.",
          type: 'warning'
        })
        document.getElementsByClassName('q-select')[0].focus()
        return
      }
      await db.list.where('listname').equals(`${this.listname}`).count().then(
        result => {
          if (result === 0) {
            db.list.bulkAdd(this.rows)
            this.$q.notify({
              type: 'positive',
              message: `'List ${this.listname} was saved.'`
            })
          } else {
            db.list.where('listname').equals(`${this.listname}`).delete()
            db.list.bulkAdd(this.rows)
            this.$q.notify({
              type: 'positive',
              message: `'List ${this.listname} was updated.'`
            })
          }
          db.listnames.where('listname').equals(`${this.listname}`).count().then(
            result => {
              if (result === 0) {
                db.listnames.add({ listname: this.listname })
              }
            }
          )
        }
      )
    },
    async getList () {
      if (this.listname === '') {
        this.$q.notify({
          message: "Please enter a list's name.",
          type: 'warning'
        })
        document.getElementsByClassName('q-select')[0].focus()
        return
      }
      this.isnewListname = false
      if (db.list.where('listname').equals(`${this.listname}`).count() !== 0) {
        await db.list.where('listname').equals(`${this.listname}`).toArray().then(
          result => {
            this.rows = result
            this.$q.notify({
              type: 'positive',
              message: `'List ${this.listname} read from disk.'`
            })
          }
        )
      } else {
        this.$q.notify({
          type: 'positive',
          message: 'New list ready to include colors.'
        })
      }
    },
    createValue (val, done) {
      // Calling done(var) when new-value-mode is not set or "add", or done(var, "add") adds "var" content to the model
      // and it resets the input textbox to empty string
      // ----
      // Calling done(var) when new-value-mode is "add-unique", or done(var, "add-unique") adds "var" content to the model
      // only if is not already set
      // and it resets the input textbox to empty string
      // ----
      // Calling done(var) when new-value-mode is "toggle", or done(var, "toggle") toggles the model with "var" content
      // (adds to model if not already in the model, removes from model if already has it)
      // and it resets the input textbox to empty string
      // ----
      // If "var" content is undefined/null, then it doesn't tampers with the model
      // and only resets the input textbox to empty string
      if (val.length > 0) {
        this.listname = val
        if (!this.allLists.includes(val)) {
          this.allLists.push(val)
          this.isnewListname = true
        }
        done(val, 'toggle')
        this.rows = []
      }
      this.$refs.hex.focus()
    },
    filterFn (val, update) {
      update(() => {
        if (val === '') {
          this.filterOptions = this.allLists
        } else {
          const needle = val.toLowerCase()
          this.filterOptions = this.allLists.filter(
            v => v.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    }
  }
}
</script>
