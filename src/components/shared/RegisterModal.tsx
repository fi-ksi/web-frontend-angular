import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { registerNewUser } from '../../api/client';
import type { components } from '../../api/schema';
import { useTranslation } from 'react-i18next';
import { COUNTRIES, COUNTRIES_KEYS } from '../../utils/countries';
import { Modal } from './Modal';
import { TermsOfUseModal } from './TermsOfUseModal';

type S = components['schemas'];

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
  initialPassword?: string;
  onRegistered: (email: string, password: string) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHIRT_SIZES = ['NA', 'XS', 'S', 'M', 'L', 'XL'];

interface RegisterForm {
  firstName: string;
  lastName: string;
  nick: string;
  sex: string;
  shirtSize: string;
  email: string;
  password: string;
  passwordRepeat: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  schoolName: string;
  schoolEnd: string;
  schoolAddress: string;
  schoolCity: string;
  schoolPostalCode: string;
  schoolCountry: string;
  aboutMe: string;
  tos: boolean;
}

const EMPTY_FORM: RegisterForm = {
  firstName: '', lastName: '', nick: '', sex: '', shirtSize: 'NA',
  email: '', password: '', passwordRepeat: '',
  address: '', city: '', postalCode: '', country: '',
  schoolName: '', schoolEnd: '', schoolAddress: '', schoolCity: '', schoolPostalCode: '', schoolCountry: '',
  aboutMe: '', tos: false
};

/**
 * Registration dialog. On success it reports back through onRegistered so
 * the caller can log the new user in.
 */
export function RegisterModal({ open, onClose, initialEmail = '', initialPassword = '', onRegistered }: RegisterModalProps): React.ReactElement {
  const { t } = useTranslation();
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [tosOpen, setTosOpen] = useState(false);
  const [countryTouched, setCountryTouched] = useState({ country: false, schoolCountry: false });

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, email: initialEmail, password: initialPassword, passwordRepeat: initialPassword });
      setCountryTouched({ country: false, schoolCountry: false });
    }
  }, [open, initialEmail, initialPassword]);

  const set = (key: keyof RegisterForm) => (value: string | boolean) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'country' && !countryTouched.schoolCountry) next.schoolCountry = value as string;
      if (key === 'schoolCountry' && !countryTouched.country) next.country = value as string;
      return next;
    });
  };

  const valid =
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.sex !== '' &&
    EMAIL_RE.test(form.email) &&
    form.password.length >= 6 &&
    form.password === form.passwordRepeat &&
    form.address.trim() !== '' &&
    form.city.trim() !== '' &&
    form.postalCode.trim() !== '' &&
    form.country !== '' &&
    form.schoolName.trim() !== '' &&
    form.schoolEnd.trim() !== '' &&
    form.schoolAddress.trim() !== '' &&
    form.schoolCity.trim() !== '' &&
    form.schoolPostalCode.trim() !== '' &&
    form.schoolCountry !== '' &&
    form.tos;

  const mutation = useMutation({
    mutationFn: async (): Promise<string> => {
      const req: S['RegistrationRequest'] = {
        email: form.email,
        nick_name: form.nick || undefined,
        first_name: form.firstName,
        last_name: form.lastName,
        gender: form.sex,
        short_info: form.aboutMe,
        addr_street: form.address,
        addr_city: form.city,
        addr_zip: form.postalCode,
        addr_country: form.country,
        school_name: form.schoolName,
        school_street: form.schoolAddress,
        school_city: form.schoolCity,
        school_zip: form.schoolPostalCode,
        school_country: form.schoolCountry,
        school_finish: Number(form.schoolEnd),
        tshirt_size: form.shirtSize,
        password: form.password,
        referral: '',
        github: null,
        discord: null
      };
      const resp = await registerNewUser(req);
      return resp?.error || '';
    },
    onSuccess: (error) => {
      if (!error) {
        onRegistered(form.email, form.password);
      }
    }
  });

  const optional = t('modal.register.optional');

  const input = (
    key: keyof RegisterForm,
    placeholder: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <input
      type="text"
      className="form-control"
      placeholder={placeholder}
      value={form[key] as string}
      onChange={(e) => set(key)(e.target.value)}
      {...props}
    />
  );

  return (
    <Modal open={open} title="modal.register.title" onClose={onClose} size="lg">
      <div className="container">
        <div className="row"><h2>{t('modal.register.about-me.title')}</h2></div>
        <div className="row">
          <div className="col-sm-6 col-md-4">{input('firstName', t('modal.register.about-me.first-name'))}</div>
          <div className="col-sm-6 col-md-4">{input('lastName', t('modal.register.about-me.last-name'))}</div>
          <div className="col-sm-12 col-md-4">
            <select className="form-control" value={form.sex} onChange={(e) => set('sex')(e.target.value)}>
              <option value="">{t('modal.register.about-me.sex.title')}</option>
              <option value="male">{t('modal.register.about-me.sex.male')}</option>
              <option value="female">{t('modal.register.about-me.sex.female')}</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-6">{input('nick', optional + t('modal.register.about-me.nickname'))}</div>
          <div className="col-sm-12 col-md-6">
            <select className="form-control" value={form.shirtSize} onChange={(e) => set('shirtSize')(e.target.value)}>
              {SHIRT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size === 'NA' ? optional + t('modal.register.about-me.shirt-size') : size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row"><h2>{t('modal.register.account.title')}</h2></div>
        <div className="row">
          <div className="col-sm-12 col-lg-4">{input('email', t('modal.register.account.email'), { type: 'email' })}</div>
          <div className="col-sm-6 col-lg-4">{input('password', t('modal.register.account.password'), { type: 'password' })}</div>
          <div className="col-sm-6 col-lg-4">{input('passwordRepeat', t('modal.register.account.password-repeat'), { type: 'password' })}</div>
        </div>

        <div className="row"><h2>{t('modal.register.address.title')}</h2></div>
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-3">{input('address', t('modal.register.address.street'))}</div>
          <div className="col-sm-12 col-md-6 col-lg-3">{input('city', t('modal.register.address.city'))}</div>
          <div className="col-sm-12 col-md-6 col-lg-3">{input('postalCode', t('modal.register.address.postal-code'))}</div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <select
              className="form-control"
              value={form.country}
              onChange={(e) => { setCountryTouched((s) => ({ ...s, country: true })); set('country')(e.target.value); }}
            >
              <option value="">{t('modal.register.address.country')}</option>
              {COUNTRIES_KEYS.map((code) => <option key={code} value={code}>{COUNTRIES[code]}</option>)}
            </select>
          </div>
        </div>

        <div className="row"><h2>{t('modal.register.school.title')}</h2></div>
        <div className="row">
          <div className="col-sm-12 col-md-6">{input('schoolName', t('modal.register.school.name'))}</div>
          <div className="col-sm-12 col-md-6">{input('schoolEnd', t('modal.register.school.end'), { type: 'number' })}</div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-3">{input('schoolAddress', t('modal.register.address.street'))}</div>
          <div className="col-sm-12 col-md-6 col-lg-3">{input('schoolCity', t('modal.register.address.city'))}</div>
          <div className="col-sm-12 col-md-6 col-lg-3">{input('schoolPostalCode', t('modal.register.address.postal-code'))}</div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <select
              className="form-control"
              value={form.schoolCountry}
              onChange={(e) => { setCountryTouched((s) => ({ ...s, schoolCountry: true })); set('schoolCountry')(e.target.value); }}
            >
              <option value="">{t('modal.register.address.country')}</option>
              {COUNTRIES_KEYS.map((code) => <option key={code} value={code}>{COUNTRIES[code]}</option>)}
            </select>
          </div>
        </div>

        <div className="row"><h2>{t('modal.register.tos.title')}</h2></div>
        <div className="row">
          <div className="col-12 tos-checkbox-container">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="checkbox-tos"
                checked={form.tos}
                onChange={(e) => set('tos')(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="checkbox-tos">
                {t('modal.register.tos.agreed')}{' '}
                <a className="clickable" onClick={(e) => { e.preventDefault(); setTosOpen(true); }}>
                  {t('modal.register.tos.text')}
                </a>
              </label>
            </div>
          </div>
        </div>
      </div>

      {mutation.data && (
        <div className="alert alert-danger" role="alert">{mutation.data}</div>
      )}

      <div className="row">
        <button
          className="btn btn-ksi btn-register w-100"
          disabled={!valid || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {t('modal.register.register')}
        </button>
      </div>

      <TermsOfUseModal open={tosOpen} onClose={() => setTosOpen(false)} />
    </Modal>
  );
}
