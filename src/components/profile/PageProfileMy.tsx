import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { ROUTES } from '../../routes';
import {
  changePassword,
  profileEditMy,
  profileGetMy,
  profileUploadPictureForm,
  usersGetSingleDiscordInvite
} from '../../api/client';
import type { components } from '../../api/schema';
import { COUNTRIES } from '../../utils/countries';
import './PageProfileMy.scss';

type S = components['schemas'];

const EDIT_ICON = '🖉';

interface ProfileFormState {
  email: string;
  firstName: string;
  lastName: string;
  nick: string;
  sex: string;
  github: string;
  discord: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  schoolName: string;
  schoolAddress: string;
  schoolCity: string;
  schoolPostalCode: string;
  schoolCountry: string;
  schoolEnd: string;
  aboutMe: string;
  shirtSize: string;
}

const EMPTY_FORM: ProfileFormState = {
  email: '',
  firstName: '',
  lastName: '',
  nick: '',
  sex: '',
  github: '',
  discord: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  schoolName: '',
  schoolAddress: '',
  schoolCity: '',
  schoolPostalCode: '',
  schoolCountry: '',
  schoolEnd: '',
  aboutMe: '',
  shirtSize: 'NA'
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isProfileFormValid(form: ProfileFormState): boolean {
  return (
    EMAIL_RE.test(form.email) &&
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.sex !== '' &&
    form.address.trim() !== '' &&
    form.city.trim() !== '' &&
    form.postalCode.trim() !== '' &&
    form.country !== '' &&
    form.schoolName.trim() !== '' &&
    form.schoolAddress.trim() !== '' &&
    form.schoolCity.trim() !== '' &&
    form.schoolPostalCode.trim() !== '' &&
    form.schoolCountry !== '' &&
    form.schoolEnd.trim() !== ''
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label className="form-label" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

function Field({
  id,
  label,
  children
}: {
  id: string;
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </>
  );
}

/**
 * My profile settings: profile edit form, password change and profile
 * picture upload.
 */
export function PageProfileMy() {
  const { t } = useTranslation();
  const { user: loggedUser, refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(
    () => typeof window !== 'undefined' && window.location.hash === `#${ROUTES.profile.settings.password}`
  );
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [loaded, setLoaded] = useState(false);
  const [password, setPassword] = useState({ current: '', new: '', repeat: '' });
  const [passwordResult, setPasswordResult] = useState<boolean | null>(null);
  const pictureSelectorRef = useRef<HTMLInputElement>(null);
  const [pictureUploading, setPictureUploading] = useState(false);
  const [pictureVersion, setPictureVersion] = useState(Date.now());

  const loadQuery = useQuery({
    queryKey: ['profile-my'],
    queryFn: () => profileGetMy().then((r) => r.profile),
    enabled: !!loggedUser
  });

  useEffect(() => {
    const profile = loadQuery.data;
    if (profile && !loaded) {
      setForm({
        email: profile.email ?? '',
        firstName: profile.first_name ?? '',
        lastName: profile.last_name ?? '',
        nick: profile.nick_name ?? '',
        sex: profile.gender ?? '',
        github: profile.github ?? '',
        discord: profile.discord ?? '',
        address: profile.addr_street ?? '',
        city: profile.addr_city ?? '',
        postalCode: profile.addr_zip ?? '',
        country: profile.addr_country ?? '',
        schoolName: profile.school_name ?? '',
        schoolAddress: profile.school_street ?? '',
        schoolCity: profile.school_city ?? '',
        schoolPostalCode: profile.school_zip ?? '',
        schoolCountry: profile.school_country ?? '',
        schoolEnd: profile.school_finish !== undefined && profile.school_finish !== null ? String(profile.school_finish) : '',
        aboutMe: profile.short_info ?? '',
        shirtSize: profile.tshirt_size ?? 'NA'
      });
      setLoaded(true);
    }
  }, [loadQuery.data, loaded]);

  const discordInviteQuery = useQuery({
    queryKey: ['discord-invite', loggedUser?.id],
    queryFn: () => usersGetSingleDiscordInvite(loggedUser!.id),
    enabled: !!loggedUser
  });

  const saveMutation = useMutation({
    mutationFn: (edit: S['ProfileEdit']) => profileEditMy(edit),
    onSuccess: () => refreshUser()
  });

  const passwordMutation = useMutation({
    mutationFn: (body: S['ChangePasswordRequest']) => changePassword(body),
    onSuccess: (result) => {
      const ok = result.result === 'ok';
      setPasswordResult(ok);
      if (ok) {
        setPassword({ current: '', new: '', repeat: '' });
      }
    },
    onError: (err: unknown) => {
      const status = (err as { status?: number })?.status;
      if (status === 400 || status === 401) {
        setPasswordResult(false);
      } else {
        setPasswordResult(false);
      }
    }
  });

  const set = (key: keyof ProfileFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProfileFormValid(form) || saveMutation.isPending) {
      return;
    }
    const edit: S['ProfileEdit'] = {
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
      github: form.github || null,
      discord: form.discord || null
    };
    saveMutation.mutate(edit);
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.current === '' || password.new === '' || password.new.length < 6 || password.new !== password.repeat) {
      return;
    }
    passwordMutation.mutate({
      old_password: password.current,
      new_password: password.new,
      new_password2: password.repeat
    });
  };

  const uploadPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    e.target.value = '';
    if (!file) {
      return;
    }
    setPictureUploading(true);
    try {
      await profileUploadPictureForm(file);
      refreshUser();
      setPictureVersion(Date.now());
    } finally {
      setPictureUploading(false);
    }
  };

  const countries = Object.entries(COUNTRIES);
  const profilePicture = loggedUser?.profile_picture ? `${loggedUser.profile_picture}?${pictureVersion}` : null;

  if (!loggedUser) {
    return <div className="content">…</div>;
  }

  return (
    <div className="content">
      {profilePicture && (
        <div className="profile-picture">
          <input
            ref={pictureSelectorRef}
            style={{ display: 'none' }}
            type="file"
            onChange={uploadPicture}
            accept="image/*"
          />
          <button
            disabled={pictureUploading}
            className="btn btn-outline-primary edit"
            title={t('profile.my.change-picture')}
            onClick={() => pictureSelectorRef.current?.click()}
          >
            {EDIT_ICON}
          </button>
          <img className="picture" src={profilePicture} alt="" />
        </div>
      )}

      {showPassword ? (
        <>
          <button className="link-subpage btn btn-link" onClick={() => setShowPassword(false)}>
            {t('profile.my.edit-profile')}
          </button>

          <h2>{t('profile.my.change-password')}</h2>
          <form className="form" onSubmit={submitPassword}>
            <Field id="pw-current" label={t('profile.my.account.password-current')}>
              <input
                id="pw-current"
                type="password"
                placeholder={t('profile.my.account.password-current')}
                className="form-control"
                value={password.current}
                onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
              />
            </Field>

            <Field id="pw-new" label={t('profile.my.account.password')}>
              <input
                id="pw-new"
                type="password"
                placeholder={t('profile.my.account.password')}
                className="form-control"
                value={password.new}
                onChange={(e) => setPassword((p) => ({ ...p, new: e.target.value }))}
              />
            </Field>

            <Field id="pw-repeat" label={t('profile.my.account.password-repeat')}>
              <input
                id="pw-repeat"
                type="password"
                placeholder={t('profile.my.account.password-repeat')}
                className="form-control"
                value={password.repeat}
                onChange={(e) => setPassword((p) => ({ ...p, repeat: e.target.value }))}
              />
            </Field>

            {passwordMutation.isPending && <div>…</div>}

            <button
              className="btn btn-ksi btn-save w-100"
              type="submit"
              disabled={
                passwordMutation.isPending ||
                password.current === '' ||
                password.new.length < 6 ||
                password.new !== password.repeat
              }
            >
              {t('profile.my.change-password')}
            </button>

            {passwordResult !== null &&
              (passwordResult ? (
                <p className="alert alert-success">{t('profile.my.password-change-success')}</p>
              ) : (
                <p className="alert alert-danger">{t('profile.my.password-change-failed')}</p>
              ))}
          </form>
        </>
      ) : (
        <>
          <button className="link-subpage btn btn-link" onClick={() => setShowPassword(true)}>
            {t('profile.my.do-change-password')}
          </button>

          <form className="form" onSubmit={submitProfile}>
            <h2>{t('profile.my.about-me.title')}</h2>

            <Field id="firstName" label={t('profile.my.about-me.first-name')}>
              <input
                id="firstName"
                type="text"
                className="form-control"
                placeholder={t('profile.my.about-me.first-name')}
                value={form.firstName}
                onChange={set('firstName')}
                disabled={!loaded}
              />
            </Field>
            <Field id="lastName" label={t('profile.my.about-me.last-name')}>
              <input
                id="lastName"
                type="text"
                className="form-control"
                placeholder={t('profile.my.about-me.last-name')}
                value={form.lastName}
                onChange={set('lastName')}
                disabled={!loaded}
              />
            </Field>
            <Field id="sex" label={t('profile.my.about-me.sex.title')}>
              <select id="sex" className="form-control" value={form.sex} onChange={set('sex')} disabled={!loaded}>
                <option value="">{t('profile.my.about-me.sex.title')}</option>
                <option value="male">{t('profile.my.about-me.sex.male')}</option>
                <option value="female">{t('profile.my.about-me.sex.female')}</option>
              </select>
            </Field>
            <Field id="nick" label={t('profile.my.about-me.nickname')}>
              <input
                id="nick"
                type="text"
                className="form-control"
                placeholder={t('profile.my.about-me.nickname')}
                value={form.nick}
                onChange={set('nick')}
                disabled={!loaded}
              />
            </Field>
            <Field id="shirtSize" label={t('profile.my.about-me.shirt-size')}>
              <select
                id="shirtSize"
                className="form-control"
                value={form.shirtSize}
                onChange={set('shirtSize')}
                disabled={!loaded}
              >
                <option value="NA">{t('profile.my.about-me.shirt-size')}</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </Field>
            <Field id="github" label={t('profile.my.about-me.github')}>
              <input
                id="github"
                type="text"
                className="form-control"
                placeholder={t('profile.my.about-me.github')}
                value={form.github}
                onChange={set('github')}
                disabled={!loaded}
              />
            </Field>
            <Field id="discord" label={
              <>
                {t('profile.my.about-me.discord')}
                {discordInviteQuery.data && (
                  <>
                    {' - '}
                    <a href={discordInviteQuery.data} target="_blank" rel="noreferrer">
                      {t('profile.my.discord-join')}
                    </a>
                  </>
                )}
              </>
            }>
              <input
                id="discord"
                type="text"
                className="form-control"
                placeholder={t('profile.my.about-me.discord')}
                value={form.discord}
                onChange={set('discord')}
                disabled={!loaded}
              />
            </Field>

            <h2>{t('profile.my.address.title')}</h2>
            <Field id="address" label={t('profile.my.address.street')}>
              <input
                id="address"
                type="text"
                className="form-control"
                placeholder={t('profile.my.address.street')}
                value={form.address}
                onChange={set('address')}
                disabled={!loaded}
              />
            </Field>
            <Field id="city" label={t('profile.my.address.city')}>
              <input
                id="city"
                type="text"
                className="form-control"
                placeholder={t('profile.my.address.city')}
                value={form.city}
                onChange={set('city')}
                disabled={!loaded}
              />
            </Field>
            <Field id="postalCode" label={t('profile.my.address.postal-code')}>
              <input
                id="postalCode"
                type="text"
                className="form-control"
                placeholder={t('profile.my.address.postal-code')}
                value={form.postalCode}
                onChange={set('postalCode')}
                disabled={!loaded}
              />
            </Field>
            <Field id="country" label={t('profile.my.address.country')}>
              <select id="country" className="form-control" value={form.country} onChange={set('country')} disabled={!loaded}>
                <option value="">{t('profile.my.address.country')}</option>
                {countries.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>

            <h2>{t('profile.my.school.title')}</h2>
            <Field id="schoolName" label={t('profile.my.school.name')}>
              <input
                id="schoolName"
                type="text"
                className="form-control"
                placeholder={t('profile.my.school.name')}
                value={form.schoolName}
                onChange={set('schoolName')}
                disabled={!loaded}
              />
            </Field>
            <Field id="schoolEnd" label={t('profile.my.school.end')}>
              <input
                id="schoolEnd"
                type="number"
                className="form-control"
                placeholder={t('profile.my.school.end')}
                value={form.schoolEnd}
                onChange={set('schoolEnd')}
                disabled={!loaded}
              />
            </Field>
            <Field id="schoolAddress" label={t('profile.my.address.street')}>
              <input
                id="schoolAddress"
                type="text"
                className="form-control"
                placeholder={t('profile.my.address.street')}
                value={form.schoolAddress}
                onChange={set('schoolAddress')}
                disabled={!loaded}
              />
            </Field>
            <Field id="schoolCity" label={t('profile.my.address.city')}>
              <input
                id="schoolCity"
                type="text"
                className="form-control"
                placeholder={t('profile.my.address.city')}
                value={form.schoolCity}
                onChange={set('schoolCity')}
                disabled={!loaded}
              />
            </Field>
            <Field id="schoolPostalCode" label={t('profile.my.address.postal-code')}>
              <input
                id="schoolPostalCode"
                type="text"
                className="form-control"
                placeholder={t('profile.my.address.postal-code')}
                value={form.schoolPostalCode}
                onChange={set('schoolPostalCode')}
                disabled={!loaded}
              />
            </Field>
            <Field id="schoolCountry" label={t('profile.my.address.country')}>
              <select
                id="schoolCountry"
                className="form-control"
                value={form.schoolCountry}
                onChange={set('schoolCountry')}
                disabled={!loaded}
              >
                <option value="">{t('profile.my.address.country')}</option>
                {countries.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>

            {saveMutation.isPending && <div>…</div>}

            <button
              className="btn btn-ksi btn-save w-100"
              type="submit"
              disabled={!isProfileFormValid(form) || saveMutation.isPending || !loaded}
            >
              {t('profile.my.save')}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
