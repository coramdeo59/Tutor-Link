import { Role } from "@/lib/types"

export function Review({
  data,
  photoPreviewUrl,
}: {
  data: any
  photoPreviewUrl: string | null
}) {
  const isTutor = data.role === Role.TUTOR
  const isParent = data.role === Role.PARENT

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Review Your Information</h3>
        <p className="mt-2">Please review your information before submitting</p>
      </div>

      <div className="rounded-xl border p-6 bg-white">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-500">Role</h4>
            <p className="mt-1 text-lg font-medium capitalize">{String(data.role)}</p>
          </div>

          <div>
            <h4 className="font-medium text-slate-500">Email</h4>
            <p className="mt-1 text-lg font-medium">{String(data.email)}</p>
          </div>

          <div>
            <h4 className="font-medium text-slate-500">Full Name</h4>
            <p className="mt-1 text-lg font-medium">
              {String(data.firstName)} {String(data.lastName)}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-slate-500">Phone</h4>
            <p className="mt-1 text-lg font-medium">{String(data.phoneNumber)}</p>
          </div>

          <div>
            <h4 className="font-medium text-slate-500">Location</h4>
            <p className="mt-1 text-lg font-medium">
              {String(data.city)}, {String(data.state)}
            </p>
          </div>

          {isTutor && (
            <>
              <div>
                <h4 className="font-medium text-slate-500">Hourly Rate</h4>
                <p className="mt-1 text-lg font-medium">{String(data.hourlyRate)} ETB</p>
              </div>

              <div className="col-span-2">
                <h4 className="font-medium text-slate-500">Bio</h4>
                <p className="mt-1">{String(data.bio)}</p>
              </div>

              <div className="col-span-2">
                <h4 className="font-medium text-slate-500">Full Address</h4>
                <p className="mt-1">
                  {String(data.street)}, {String(data.city)}, {String(data.state)} {String(data.zipCode || "")},{" "}
                  {String(data.country)}
                </p>
              </div>

              {/* Verification Information */}
              <div className="col-span-2 border-t pt-4 mt-2">
                <h4 className="font-medium text-slate-500 text-lg">Verification Information</h4>
              </div>

              {data.fanNumber && (
                <div>
                  <h4 className="font-medium text-slate-500">National ID/FAN Number</h4>
                  <p className="mt-1">{String(data.fanNumber)}</p>
                </div>
              )}

              {data.educationLevel && (
                <div>
                  <h4 className="font-medium text-slate-500">Education Level</h4>
                  <p className="mt-1">{String(data.educationLevel)}</p>
                </div>
              )}

              {data.graduationYear && (
                <div>
                  <h4 className="font-medium text-slate-500">Graduation Year</h4>
                  <p className="mt-1">{String(data.graduationYear)}</p>
                </div>
              )}

              {data.institutionName && (
                <div>
                  <h4 className="font-medium text-slate-500">Institution</h4>
                  <p className="mt-1">{String(data.institutionName)}</p>
                </div>
              )}

              {data.degree && (
                <div>
                  <h4 className="font-medium text-slate-500">Degree/Field of Study</h4>
                  <p className="mt-1">{String(data.degree)}</p>
                </div>
              )}

              {data.yearsOfExperience !== undefined && (
                <div>
                  <h4 className="font-medium text-slate-500">Years of Experience</h4>
                  <p className="mt-1">{String(data.yearsOfExperience)}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-slate-500">Teaching Certificate</h4>
                <p className="mt-1">{data.hasTeachingCertificate ? "Yes" : "No"}</p>
              </div>
            </>
          )}

          {isParent && (
            <>
              <div>
                <h4 className="font-medium text-slate-500">Preferred Communication</h4>
                <p className="mt-1 text-lg font-medium capitalize">{String(data.preferred_communication || "email")}</p>
              </div>

              <div className="col-span-2">
                <h4 className="font-medium text-slate-500">Preferred Subjects</h4>
                <p className="mt-1">{data.preferredSubjects ? String(data.preferredSubjects) : "None specified"}</p>
              </div>
            </>
          )}

          <div className="col-span-2 border-t pt-4 mt-2">
            <h4 className="font-medium text-slate-500">Profile Photo</h4>
            {photoPreviewUrl ? (
              <div className="mt-3 h-24 w-24 overflow-hidden rounded-full border-2 border-amber-100">
                <img
                  src={photoPreviewUrl || "/placeholder.svg"}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <p className="mt-1">No photo uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
