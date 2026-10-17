/**
 * @file src/module/registration/components/registration-form/sections/PersonalDetailsSection.tsx
 * Part 1 — Personal & Family Details: identification, education, profession,
 * community/gotra, physical attributes, marital history, parents & siblings,
 * address and contact details.
 */

import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { FormSelect } from '@/components/ui/form-select'
import { OptionPills } from '@/components/ui/option-pills'
import { cn } from 'cn'
import { useRegistrationForm } from '../context'

export default function PersonalDetailsSection() {
  const {
    baseId,
    form,
    fieldErrors,
    clearFieldError,
    setForm,
    handleInputChange,
    handleNumericInput,
    handleSelectChange,
    handleTimeChange,
    handlePillChange,
    toggleCommunityPreference,
    selectAllCommunities,
    educationOptions,
    professionOptions,
    communityOptions,
    gotraOptions,
    loadingGotras,
    conditions,
    isMobileVerifiedNow,
    isMobileComplete,
    openOtpModal,
  } = useRegistrationForm()

  const { isEmployed, isBusiness, isOtherProfession, showIncome, isDivorced, hasPriorMarriage, showChildrenWith } =
    conditions

  // Dynamic CSS helper based on field validation status (shadcn-aligned brand style)
  const inputCls = (key: string) =>
    cn(
      'w-full rounded-xl border px-4 py-2.5 text-sm text-navy-900 transition outline-none focus-visible:ring-2',
      fieldErrors[key]
        ? 'border-maroon-500 bg-maroon-50/30 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20'
        : 'border-cream-300 bg-cream-50/70 hover:bg-white focus-visible:border-gold-500 focus-visible:bg-white focus-visible:ring-gold-500/20',
    )

  return (
    <div className="rounded-[1.5rem] border border-gold-500/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card">
      <div className="mb-6 border-b border-cream-200 pb-4">
        <span className="eyebrow">Part 1</span>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-navy-900">
          Personal &amp; Family Details
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Basic identification, educational qualifications, background, and family records.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Full Name */}
        <Field id={`${baseId}-name`} label="Full Name" required error={fieldErrors.name}>
          <Input
            id={`${baseId}-name`}
            type="text"
            name="name"
            maxLength={45}
            value={form.name}
            onChange={handleInputChange}
            placeholder="Candidate Full Name"
            className={inputCls('name')}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? `${baseId}-name-error` : undefined}
          />
        </Field>

        {/* Gender (radio pill selection) */}
        <div id={`${baseId}-gender`}>
          <span className="mb-1.5 block text-xs font-bold text-navy-900">
            Gender <span className="text-maroon-600">*</span>
          </span>
          <OptionPills
            id={`${baseId}-gender-pills`}
            name="gender"
            value={form.gender}
            onChange={handleSelectChange('gender')}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
            ]}
            error={Boolean(fieldErrors.gender)}
            ariaLabel="Gender"
          />
          {fieldErrors.gender && (
            <p role="alert" id={`${baseId}-gender-error`} className="mt-1.5 text-[11px] font-semibold text-maroon-600">
              {fieldErrors.gender}
            </p>
          )}
        </div>

        {/* Date of Birth with shadcn-styled DatePicker */}
        <div id={`${baseId}-dob`}>
          <Field id={`${baseId}-dob-day`} label="Date of Birth" required error={fieldErrors.date_of_birth}>
            <DatePicker
              id={`${baseId}-dob`}
              value={form.date_of_birth}
              onChange={(dateStr) => {
                setForm((prev) => ({ ...prev, date_of_birth: dateStr }))
                clearFieldError('date_of_birth')
              }}
              error={Boolean(fieldErrors.date_of_birth)}
            />
          </Field>
        </div>

        {/* Time of Birth with shadcn-styled TimePicker */}
        <div id={`${baseId}-birthtime`}>
          <Field id={`${baseId}-birthtime-hour`} label="Time of Birth" required error={fieldErrors.time_of_birth}>
            <TimePicker
              id={`${baseId}-birthtime`}
              value={form.time_of_birth}
              onChange={handleTimeChange}
              error={Boolean(fieldErrors.time_of_birth)}
            />
          </Field>
        </div>

        {/* Place of Birth */}
        <Field id={`${baseId}-pob`} label="Place of Birth" required error={fieldErrors.place_of_birth}>
          <Input
            id={`${baseId}-pob`}
            type="text"
            name="place_of_birth"
            maxLength={25}
            value={form.place_of_birth}
            onChange={handleInputChange}
            placeholder="City / District"
            className={inputCls('place_of_birth')}
            aria-invalid={Boolean(fieldErrors.place_of_birth)}
          />
        </Field>

        {/* Email Address (optional) */}
        <Field id={`${baseId}-email`} label="Email Address" error={fieldErrors.email}>
          <Input
            id={`${baseId}-email`}
            type="email"
            name="email"
            maxLength={65}
            value={form.email}
            onChange={handleInputChange}
            placeholder="name@example.com"
            className={inputCls('email')}
            aria-invalid={Boolean(fieldErrors.email)}
          />
        </Field>

        {/* Education Qualification (API Dropdown) */}
        <Field id={`${baseId}-edu`} label="Education" required error={fieldErrors.education_id}>
          <FormSelect
            id={`${baseId}-edu`}
            value={form.education_id}
            onValueChange={handleSelectChange('education_id')}
            options={educationOptions}
            placeholder="Select Qualification"
            error={Boolean(fieldErrors.education_id)}
            searchable
            searchPlaceholder="Search qualification..."
            aria-invalid={Boolean(fieldErrors.education_id)}
          />
        </Field>

        {/* Profession (API Dropdown) */}
        <Field id={`${baseId}-profession`} label="Profession" required error={fieldErrors.profession_id}>
          <FormSelect
            id={`${baseId}-profession`}
            value={form.profession_id}
            onValueChange={handleSelectChange('profession_id')}
            options={professionOptions}
            placeholder="Select Profession"
            error={Boolean(fieldErrors.profession_id)}
            searchable
            searchPlaceholder="Search profession..."
            aria-invalid={Boolean(fieldErrors.profession_id)}
          />
        </Field>

        {/* Condition 2: Dynamic fields based on Profession */}
        {isEmployed && (
          <>
            <div className="animate-fade-in">
              <Field id={`${baseId}-company`} label="Company Name" error={fieldErrors.company_name}>
                <Input
                  id={`${baseId}-company`}
                  type="text"
                  name="company_name"
                  maxLength={45}
                  value={form.company_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Infosys, TCS, Govt Dept"
                  className={inputCls('company_name')}
                  aria-invalid={Boolean(fieldErrors.company_name)}
                />
              </Field>
            </div>
            <div className="animate-fade-in">
              <Field id={`${baseId}-company-type`} label="Company Type" error={fieldErrors.company_type}>
                <Input
                  id={`${baseId}-company-type`}
                  type="text"
                  name="company_type"
                  maxLength={45}
                  value={form.company_type}
                  onChange={handleInputChange}
                  placeholder="e.g. IT, Banking, PSU"
                  className={inputCls('company_type')}
                  aria-invalid={Boolean(fieldErrors.company_type)}
                />
              </Field>
            </div>
          </>
        )}

        {isBusiness && (
          <>
            <div className="animate-fade-in">
              <Field id={`${baseId}-biz-name`} label="Business Name" error={fieldErrors.company_name}>
                <Input
                  id={`${baseId}-biz-name`}
                  type="text"
                  name="company_name"
                  maxLength={45}
                  value={form.company_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Agarwal Traders"
                  className={inputCls('company_name')}
                  aria-invalid={Boolean(fieldErrors.company_name)}
                />
              </Field>
            </div>
            <div className="animate-fade-in">
              <Field id={`${baseId}-biz-type`} label="Business Type" error={fieldErrors.company_type}>
                <Input
                  id={`${baseId}-biz-type`}
                  type="text"
                  name="company_type"
                  maxLength={45}
                  value={form.company_type}
                  onChange={handleInputChange}
                  placeholder="e.g. Retail, Wholesale, Manufacturing"
                  className={inputCls('company_type')}
                  aria-invalid={Boolean(fieldErrors.company_type)}
                />
              </Field>
            </div>
          </>
        )}

        {isOtherProfession && (
          <div className="animate-fade-in">
            <Field id={`${baseId}-other-prof`} label="Other Profession" error={fieldErrors.company_name}>
              <Input
                id={`${baseId}-other-prof`}
                type="text"
                name="company_name"
                maxLength={45}
                value={form.company_name}
                onChange={handleInputChange}
                placeholder="Specify Profession"
                className={inputCls('company_name')}
                aria-invalid={Boolean(fieldErrors.company_name)}
              />
            </Field>
          </div>
        )}

        {showIncome && (
          <div className="animate-fade-in">
            <Field
              id={`${baseId}-income`}
              label="Annual Income (in Lakhs)"
              hint="Max 300"
              error={fieldErrors.annual_income}
            >
              <Input
                id={`${baseId}-income`}
                type="text"
                name="annual_income"
                maxLength={3}
                value={form.annual_income}
                onChange={(e) => handleNumericInput(e, 300)}
                placeholder="e.g. 15"
                className={inputCls('annual_income')}
                aria-invalid={Boolean(fieldErrors.annual_income)}
              />
            </Field>
          </div>
        )}

        {/* My Community (API Dropdown) */}
        <Field id={`${baseId}-community`} label="My Community" required error={fieldErrors.community_id}>
          <FormSelect
            id={`${baseId}-community`}
            value={form.community_id}
            onValueChange={handleSelectChange('community_id')}
            options={communityOptions}
            placeholder="Select Community"
            error={Boolean(fieldErrors.community_id)}
            searchable
            searchPlaceholder="Search community..."
            aria-invalid={Boolean(fieldErrors.community_id)}
          />
        </Field>

        {/* Gotra (Cascade loaded from Community) */}
        <Field id={`${baseId}-gotra`} label="Gotra" required error={fieldErrors.gotra_id}>
          <FormSelect
            id={`${baseId}-gotra`}
            value={form.gotra_id}
            onValueChange={handleSelectChange('gotra_id')}
            options={gotraOptions}
            placeholder="Select Gotra"
            error={Boolean(fieldErrors.gotra_id)}
            disabled={!form.community_id}
            loading={loadingGotras}
            loadingText="Loading Gotras..."
            disabledText="First select Community"
            searchable
            searchPlaceholder="Search gotra..."
            aria-invalid={Boolean(fieldErrors.gotra_id)}
          />
        </Field>

        {/* Height (Feet & Inches) */}
        <div>
          <span className="mb-1.5 block text-xs font-bold text-navy-900">
            Height <span className="text-maroon-600">*</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <FormSelect
              id={`${baseId}-height-feet`}
              value={form.height_feet}
              onValueChange={handleSelectChange('height_feet')}
              options={[
                { value: '4', label: '4 ft' },
                { value: '5', label: '5 ft' },
                { value: '6', label: '6 ft' },
                { value: '7', label: '7 ft' },
              ]}
              placeholder="Feet"
              error={Boolean(fieldErrors.height_feet)}
              aria-invalid={Boolean(fieldErrors.height_feet)}
            />
            <FormSelect
              id={`${baseId}-height-inch`}
              value={form.height_inch}
              onValueChange={handleSelectChange('height_inch')}
              options={[...Array(12).keys()].map((inch) => ({
                value: String(inch),
                label: `${inch} in`,
              }))}
              placeholder="Inch"
              error={Boolean(fieldErrors.height_inch)}
              aria-invalid={Boolean(fieldErrors.height_inch)}
            />
          </div>
          {(fieldErrors.height_feet || fieldErrors.height_inch) && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
              {fieldErrors.height_feet || fieldErrors.height_inch}
            </p>
          )}
        </div>

        {/* Physical Disability */}
        <Field
          id={`${baseId}-disability`}
          label="Physical Disability (if any)"
          required
          error={fieldErrors.physical_disablity}
        >
          <OptionPills
            id={`${baseId}-disability-pills`}
            name="physical_disablity"
            value={form.physical_disablity}
            onChange={handlePillChange('physical_disablity')}
            options={[
              { value: 'No', label: 'No' },
              { value: 'Yes', label: 'Yes' },
            ]}
            error={Boolean(fieldErrors.physical_disablity)}
          />
          {/* Hidden native select keeps the focus/scroll target id stable */}
          <select
            id={`${baseId}-disability`}
            name="physical_disablity"
            value={form.physical_disablity}
            onChange={handleInputChange}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          >
            <option value="">Please Select</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </Field>
      </div>

      {/* Community Preferences multi-select chips */}
      <div id={`${baseId}-comm-prefs`} className="mt-5 border-t border-cream-200 pt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="block text-xs font-bold text-navy-900">
            Community Preferences (Select eligible communities) <span className="text-maroon-600">*</span>
          </span>
          {communityOptions.length > 0 && (
            <button
              type="button"
              onClick={selectAllCommunities}
              className="text-xs font-semibold text-gold-700 hover:text-gold-900 underline transition cursor-pointer"
            >
              {communityOptions.every((c) => form.marry_in_community.includes(c.value))
                ? 'Deselect All'
                : 'Select All Communities'}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Community preferences">
          {communityOptions.length === 0 ? (
            <p className="text-xs text-navy-500 italic">Loading communities...</p>
          ) : (
            communityOptions.map((comm) => {
              const selected = form.marry_in_community.includes(comm.value)
              return (
                <button
                  key={comm.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCommunityPreference(comm.value)}
                  className={cn(
                    'rounded-full px-4 py-2 text-xs font-semibold transition outline-none active:scale-95 cursor-pointer',
                    'focus-visible:ring-2 focus-visible:ring-gold-500/40',
                    selected
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'border border-cream-300 bg-cream-50 text-navy-800 hover:border-gold-500/60 hover:bg-gold-50',
                  )}
                >
                  {selected ? '✓ ' : '+ '}{comm.label}
                </button>
              )
            })
          )}
        </div>
        {fieldErrors.marry_in_community && (
          <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
            {fieldErrors.marry_in_community}
          </p>
        )}
      </div>

      {/* Prior Marriage Condition */}
      <div className="mt-6 border-t border-cream-200 pt-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            id={`${baseId}-prior-marriage`}
            label="Have you been married before?"
            required
            error={fieldErrors.married_before}
          >
            <FormSelect
              id={`${baseId}-prior-marriage`}
              value={form.married_before}
              onValueChange={handleSelectChange('married_before')}
              options={[
                { value: 'No', label: 'No (Never Married)' },
                { value: 'Yes and Divorced', label: 'Yes and Divorced' },
                { value: 'Yes and Spouse died', label: 'Yes and Spouse died' },
              ]}
              placeholder="Please Select"
              error={Boolean(fieldErrors.married_before)}
              aria-invalid={Boolean(fieldErrors.married_before)}
            />
          </Field>

          {/* Condition: Divorce Status */}
          {isDivorced && (
            <div className="animate-fade-in">
              <Field
                id={`${baseId}-divorce-status`}
                label="Divorce Status"
                required
                error={fieldErrors.divorce_status}
              >
                <FormSelect
                  id={`${baseId}-divorce-status`}
                  value={form.divorce_status ?? ''}
                  onValueChange={handleSelectChange('divorce_status')}
                  options={[
                    { value: 'Decree in process', label: 'Decree in process' },
                    { value: 'Decree granted less than 6 months back', label: 'Decree granted less than 6 months back' },
                    { value: 'Decree granted less than 2 years back', label: 'Decree granted less than 2 years back' },
                    { value: 'Decree granted less than 5 years back', label: 'Decree granted less than 5 years back' },
                    { value: 'Decree granted more than 5 years back', label: 'Decree granted more than 5 years back' },
                  ]}
                  placeholder="Select Divorce Status"
                  error={Boolean(fieldErrors.divorce_status)}
                  aria-invalid={Boolean(fieldErrors.divorce_status)}
                />
              </Field>
            </div>
          )}

          {/* Condition: Children from prior marriage */}
          {hasPriorMarriage && (
            <div className="animate-fade-in">
              <Field id={`${baseId}-children`} label="Children from Prior Marriage">
                <Input
                  id={`${baseId}-children`}
                  type="text"
                  name="children_from_prior_marriage"
                  maxLength={2}
                  value={form.children_from_prior_marriage}
                  onChange={handleNumericInput}
                  placeholder="Number of children (e.g. 0, 1, 2)"
                  className={inputCls('children_from_prior_marriage')}
                />
              </Field>
            </div>
          )}

          {/* Sub-condition: Children with */}
          {showChildrenWith && (
            <div className="animate-fade-in">
              <Field
                id={`${baseId}-children-with`}
                label="Children Residing With"
                required
                error={fieldErrors.children_with}
              >
                <FormSelect
                  id={`${baseId}-children-with`}
                  value={form.children_with ?? ''}
                  onValueChange={handleSelectChange('children_with')}
                  options={[
                    { value: 'All with me', label: 'All with me' },
                    { value: 'All with ex-spouse', label: 'All with ex-spouse' },
                    { value: 'Shared between us', label: 'Shared between us' },
                  ]}
                  placeholder="Select living arrangement"
                  error={Boolean(fieldErrors.children_with)}
                  aria-invalid={Boolean(fieldErrors.children_with)}
                />
              </Field>
            </div>
          )}
        </div>
      </div>

      {/* Parents and Siblings row */}
      <div className="mt-6 border-t border-cream-200 pt-5">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gold-700">
          Parents &amp; Siblings
        </h3>
        {/* Parents Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id={`${baseId}-father`} label="Father's Name" required error={fieldErrors.father_name}>
            <Input
              id={`${baseId}-father`}
              type="text"
              name="father_name"
              maxLength={25}
              value={form.father_name}
              onChange={handleInputChange}
              placeholder="Father's Full Name"
              className={inputCls('father_name')}
              aria-invalid={Boolean(fieldErrors.father_name)}
            />
          </Field>

          <Field id={`${baseId}-mother`} label="Mother's Name" error={fieldErrors.mother_name}>
            <Input
              id={`${baseId}-mother`}
              type="text"
              name="mother_name"
              maxLength={25}
              value={form.mother_name}
              onChange={handleInputChange}
              placeholder="Mother's Full Name"
              className={inputCls('mother_name')}
              aria-invalid={Boolean(fieldErrors.mother_name)}
            />
          </Field>
        </div>

        {/* Siblings Row */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field id={`${baseId}-bro-married`} label="Brothers (Married)" required error={fieldErrors.brother_married}>
            <FormSelect
              id={`${baseId}-bro-married`}
              value={form.brother_married}
              onValueChange={handleSelectChange('brother_married')}
              options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
              placeholder="0"
            />
          </Field>

          <Field id={`${baseId}-bro-unmarried`} label="Brothers (Unmarried)" required error={fieldErrors.brother_un_married}>
            <FormSelect
              id={`${baseId}-bro-unmarried`}
              value={form.brother_un_married}
              onValueChange={handleSelectChange('brother_un_married')}
              options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
              placeholder="0"
            />
          </Field>

          <Field id={`${baseId}-sis-married`} label="Sisters (Married)" required error={fieldErrors.sister_married}>
            <FormSelect
              id={`${baseId}-sis-married`}
              value={form.sister_married}
              onValueChange={handleSelectChange('sister_married')}
              options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
              placeholder="0"
            />
          </Field>

          <Field id={`${baseId}-sis-unmarried`} label="Sisters (Unmarried)" required error={fieldErrors.sister_un_married}>
            <FormSelect
              id={`${baseId}-sis-unmarried`}
              value={form.sister_un_married}
              onValueChange={handleSelectChange('sister_un_married')}
              options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
              placeholder="0"
            />
          </Field>
        </div>
      </div>

      {/* Residential Address, House type, Years */}
      <div className="mt-6 border-t border-cream-200 pt-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Field
              id={`${baseId}-address`}
              label="Current Residential Address (Candidate)"
              required
              hint={`${500 - form.user_address.length} chars left`}
              error={fieldErrors.user_address}
            >
              <Textarea
                id={`${baseId}-address`}
                name="user_address"
                rows={3}
                maxLength={500}
                value={form.user_address}
                onChange={handleInputChange}
                placeholder="Enter full address with postal pincode"
                className={inputCls('user_address')}
                aria-invalid={Boolean(fieldErrors.user_address)}
              />
            </Field>
          </div>

          <div className="space-y-4">
            <div id={`${baseId}-house-type-group`}>
              <span className="mb-1.5 block text-xs font-bold text-navy-900">
                House Type <span className="text-maroon-600">*</span>
              </span>
              <OptionPills
                id={`${baseId}-house-type-pills`}
                name="house_type"
                value={form.house_type}
                onChange={handlePillChange('house_type')}
                options={[
                  { value: 'Own', label: 'Own' },
                  { value: 'Rent', label: 'Rent' },
                ]}
                error={Boolean(fieldErrors.house_type)}
                ariaLabel="House Type"
              />
              {/* Hidden native input keeps the scroll/focus target id stable */}
              <input
                id={`${baseId}-house-type-anchor`}
                type="text"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                readOnly
                value=""
              />
              {fieldErrors.house_type && (
                <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
                  {fieldErrors.house_type}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current City & Contacts */}
      <div className="mt-6 border-t border-cream-200 pt-5">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gold-700">
          Location &amp; Contact Details
        </h3>

        {/* Primary Location & Main Contact */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            id={`${baseId}-current-city`}
            label="Present City / Parents Location"
            required
            error={fieldErrors.user_current_city}
          >
            <Input
              id={`${baseId}-current-city`}
              type="text"
              name="user_current_city"
              maxLength={45}
              value={form.user_current_city}
              onChange={handleInputChange}
              placeholder="e.g. Bengaluru, Delhi, Mumbai"
              className={inputCls('user_current_city')}
              aria-invalid={Boolean(fieldErrors.user_current_city)}
            />
          </Field>

          <Field
            id={`${baseId}-contact-name`}
            label="Main Contact Person"
            required
            error={fieldErrors.contact_name}
          >
            <Input
              id={`${baseId}-contact-name`}
              type="text"
              name="contact_name"
              maxLength={45}
              value={form.contact_name}
              onChange={handleInputChange}
              placeholder="Name of contact person"
              className={inputCls('contact_name')}
              aria-invalid={Boolean(fieldErrors.contact_name)}
            />
          </Field>

          <Field
            id={`${baseId}-contact-mobile`}
            label="Main Contact Mobile"
            required
            hint={
              isMobileVerifiedNow
                ? '✓ Mobile Verified'
                : isMobileComplete
                ? '✓ 10 digits'
                : `${form.mobile.length}/10 digits`
            }
            error={fieldErrors.mobile}
          >
            <div className="relative">
              <Input
                id={`${baseId}-contact-mobile`}
                type="tel"
                name="mobile"
                maxLength={10}
                value={form.mobile}
                onChange={handleNumericInput}
                placeholder="10-digit mobile number"
                className={cn(
                  inputCls('mobile'),
                  isMobileVerifiedNow
                    ? 'border-emerald-500 bg-emerald-50/20 pr-28 text-emerald-950 focus-visible:border-emerald-600 focus-visible:ring-emerald-500/20'
                    : isMobileComplete
                    ? 'pr-24'
                    : '',
                )}
                aria-invalid={Boolean(fieldErrors.mobile)}
              />
              {isMobileVerifiedNow ? (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  ✓ Verified
                </span>
              ) : isMobileComplete ? (
                <button
                  type="button"
                  onClick={openOtpModal}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-gold-100 hover:bg-gold-200 border border-gold-300 px-2.5 py-1 text-[11px] font-bold text-navy-900 transition active:scale-95 shadow-2xs"
                >
                  Verify OTP
                </button>
              ) : null}
            </div>
          </Field>
        </div>

        {/* Alternate Contact */}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            id={`${baseId}-alt-name`}
            label="Alternate Contact Person"
            required
            error={fieldErrors.alternate_contact_name}
          >
            <Input
              id={`${baseId}-alt-name`}
              type="text"
              name="alternate_contact_name"
              maxLength={45}
              value={form.alternate_contact_name}
              onChange={handleInputChange}
              placeholder="Relative / Parent contact"
              className={inputCls('alternate_contact_name')}
              aria-invalid={Boolean(fieldErrors.alternate_contact_name)}
            />
          </Field>

          <Field
            id={`${baseId}-alt-mobile`}
            label="Alternate Contact Mobile"
            required
            hint={
              form.alternate_mobile_no.length === 10
                ? '✓ 10 digits'
                : `${form.alternate_mobile_no.length}/10 digits`
            }
            error={fieldErrors.alternate_mobile_no}
          >
            <Input
              id={`${baseId}-alt-mobile`}
              type="tel"
              name="alternate_mobile_no"
              maxLength={10}
              value={form.alternate_mobile_no}
              onChange={handleNumericInput}
              placeholder="10-digit mobile number"
              className={inputCls('alternate_mobile_no')}
              aria-invalid={Boolean(fieldErrors.alternate_mobile_no)}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
