<template>
  <v-dialog
    :value="value"
    @input="$emit('input', $event)"
    :max-width="500"
  >
    <v-form
      ref="form"
      @submit.prevent="handleSave"
      v-model="valid"
    >
      <v-card>
        <v-card-title class="card-heading py-2">
          <span class="focus--text" v-html="$t('app.general.label.change_password')"></span>
        </v-card-title>

        <v-divider />

        <v-card-text class="mb-0" v-if="error">
          <v-alert
            type="error"
            text
            class="mb-0"
          >
            {{ $t('app.general.msg.wrong_password') }}
          </v-alert>
        </v-card-text>

        <app-setting :title="$t('app.general.label.current_password')">
          <v-text-field
            autocomplete="current-password"
            filled
            dense
            type="password"
            class="mt-0"
            hide-details="auto"
            :rules="[rules.required]"
            v-model="currentPassword">
          </v-text-field>
        </app-setting>

        <v-divider />

        <app-setting :title="$t('app.general.label.new_password')">
          <v-text-field
            autocomplete="current-password"
            filled
            dense
            type="password"
            class="mt-0"
            hide-details="auto"
            :rules="[rules.required, rules.password, rules.min]"
            v-model="password">
          </v-text-field>
        </app-setting>

        <v-divider />

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-icon
            v-if="loading"
            class="spin"
            color="primary"
          >
            $loading
          </v-icon>

          <app-btn
            :disabled="loading"
            color="warning"
            text
            @click="$emit('input', false)"
            type="button"
          >
            {{ $t('app.general.btn.cancel') }}
          </app-btn>

          <app-btn
            :disabled="loading"
            color="primary"
            type="submit"
            v-html="$t('app.general.btn.save')"
          >
          </app-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { authApi } from '@/api/auth.api'
import { Component, Vue, Prop, Watch, Ref } from 'vue-property-decorator'
import { EventBus } from '@/eventBus'

@Component({})
export default class UserPasswordDialog extends Vue {
  @Prop({ type: Boolean, default: false })
  value!: boolean

  @Ref('form') form!: HTMLFormElement

  currentPassword = ''
  password = ''
  error = false
  loading = false

  valid = false

  rules = {
    required: (v: string) => (v && v !== undefined && v !== '') || this.$t('app.general.simple_form.error.required'),
    password: (v: string) => (v && v.toLowerCase() !== this.currentUser.toLowerCase()) || this.$t('app.general.simple_form.error.password_username'),
    min: (v: string) => (v && v !== undefined && v.length >= 4) || this.$t('app.general.simple_form.error.min', { min: 4 })
  }

  get currentUser () {
    const currentUser = this.$store.getters['auth/getCurrentUser']
    return (currentUser && currentUser.username) ? currentUser.username : ''
  }

  @Watch('value')
  onOpen (val: boolean) {
    if (val) {
      this.currentPassword = ''
      this.password = ''
      this.error = false
      this.loading = false
      if (this.form) this.form.reset()
    }
  }

  handleSave () {
    if (this.valid) {
      this.loading = true
      authApi.changePassword(this.currentPassword, this.password)
        .then(() => {
          EventBus.$emit(this.$tc('app.general.msg.password_changed'), { timeout: 2000 })
          this.$emit('input', false)
        })
        .catch(() => {
          this.error = true
        })
        .finally(() => (this.loading = false))
    }
  }
}
</script>
